module GraphFile exposing
    ( GraphFile
    , MyGraph, VertexId, VertexProperties, EdgeId, EdgeProperties
    , BagDict, BagId, BagProperties
    , default
    , updateVertices, addVertex, removeVertices
    , updateEdges, addEdge, removeEdges
    , contractEdge, divideEdge
    , addBag, removeBag, updateBag
    , addStarGraph
    , duplicateSubgraph
    , setCentroidX, setCentroidY, setVertexPositions
    , getVertices, getVertexProperties, getVerticesInBag, getVertexIdsWithPositions, pullCentersWithVertices
    , getEdges
    , inducedEdges, inducedVertices
    , getBagProperties, getBags, getBagsWithVertices
    , getCommonEdgeProperty, getCommonVertexProperty
    , getCentroid, getBoundingBoxWithMargin, vertexIdsInBoundingBox, edgeIdsIntersectiongLineSegment
    , getDefaultEdgeProperties, getDefaultVertexProperties
    , updateDefaultEdgeProperties, updateDefaultVertexProperties
    , forceTick
    )

{-| This module separates the graph data from the GUI state. All the graph data which is not a GUI state lives here. In addition the default vertex and edge properties live in the same `GraphFile` type.
This module also contains operations acting on graphs needed bei the Main module. Note that the interaction of the Main module with `MyGraph` type happens only by these operators. The Main module does not import `Graph` or `MyGraph`.


# Definition

@docs GraphFile
@docs MyGraph, VertexId, VertexProperties, EdgeId, EdgeProperties
@docs BagDict, BagId, BagProperties


# Constructor

@docs default


# Graph Operations

@docs updateVertices, addVertex, removeVertices
@docs updateEdges, addEdge, removeEdges
@docs contractEdge, divideEdge
@docs addBag, removeBag, updateBag
@docs addStarGraph
@docs duplicateSubgraph
@docs setCentroidX, setCentroidY, setVertexPositions


# Graph Queries

@docs getVertices, getVertexProperties, getVerticesInBag, getVertexIdsWithPositions, pullCentersWithVertices
@docs getEdges
@docs inducedEdges, inducedVertices
@docs getBagProperties, getBags, getBagsWithVertices
@docs getCommonEdgeProperty, getCommonVertexProperty
@docs getCentroid, getBoundingBoxWithMargin, vertexIdsInBoundingBox, edgeIdsIntersectiongLineSegment


# Accessing Default Properties

@docs getDefaultEdgeProperties, getDefaultVertexProperties
@docs updateDefaultEdgeProperties, updateDefaultVertexProperties


# Force related operations

@docs forceTick


## Internals

unionWithNewGraph, setVertexPositionsForGraph

-}

import BoundingBox2d exposing (BoundingBox2d)
import Circle2d exposing (Circle2d)
import Colors
import Dict exposing (Dict)
import Dict.Extra
import Element exposing (Color)
import Graph exposing (Edge, Graph, Node, NodeContext, NodeId)
import Graph.Extra
import Graph.Force as Force exposing (Force, ForceGraph)
import Graph.Generators
import IntDict exposing (IntDict)
import LineSegment2d exposing (LineSegment2d)
import Point2d exposing (Point2d)
import Set exposing (Set)
import Vector2d exposing (Vector2d)


{-| This type holds the data that the user can (and should) have when exporting or importing graphs.
The GUI-state data does not enter here!
Everything about the GUI is in Main.elm.
-}
type GraphFile
    = GraphFile
        { graph : MyGraph
        , bags : BagDict
        , defaultVertexProperties : VertexProperties
        , defaultEdgeProperties : EdgeProperties
        }


type alias MyGraph =
    ForceGraph VertexProperties EdgeProperties


type alias VertexId =
    NodeId


type alias EdgeId =
    ( VertexId, VertexId )


type alias VertexProperties =
    { label : Maybe String
    , labelIsVisible : Bool
    , position : Point2d
    , velocity : Vector2d
    , manyBodyStrength : Float
    , gravityCenter : Point2d
    , gravityStrength : Float
    , fixed : Bool
    , color : Color
    , radius : Float
    , inBags : Set BagId
    }


type alias EdgeProperties =
    { label : Maybe String
    , labelIsVisible : Bool
    , distance : Float
    , strength : Float
    , thickness : Float
    , color : Color
    }


type alias BagDict =
    Dict BagId BagProperties


type alias BagId =
    Int


type alias Bag =
    { bagId : BagId
    , bagProperties : BagProperties
    }


type alias BagProperties =
    { label : Maybe String
    , color : Color
    , hasConvexHull : Bool
    }


default : GraphFile
default =
    GraphFile
        { graph = Graph.empty
        , bags = Dict.empty
        , defaultVertexProperties =
            { label = Nothing
            , labelIsVisible = True
            , position = Point2d.origin
            , velocity = Vector2d.zero
            , gravityCenter = Point2d.fromCoordinates ( 300, 300 )
            , gravityStrength = 0.05
            , manyBodyStrength = -100
            , color = Colors.lightGray
            , radius = 5
            , inBags = Set.empty
            , fixed = False
            }
        , defaultEdgeProperties =
            { label = Nothing
            , labelIsVisible = True
            , color = Colors.lightGray
            , thickness = 3
            , distance = 40
            , strength = 0.7
            }
        }


forceTick : Force.State -> GraphFile -> ( Force.State, GraphFile )
forceTick forceState (GraphFile p) =
    let
        ( newForceState, newGraph ) =
            Force.tick forceState p.graph
    in
    ( newForceState, GraphFile { p | graph = newGraph } )



--transitionTick :
--    Transition.State
--    -> { start : GraphFile, end : GraphFile }
--    -> ( Transition.State, GraphFile )
--transitionTick transitionState startAndEnd =
--    Transition.tick transitionState startAndEnd


mapGraph : (MyGraph -> MyGraph) -> GraphFile -> GraphFile
mapGraph f (GraphFile p) =
    GraphFile { p | graph = f p.graph }


mapBags : (BagDict -> BagDict) -> GraphFile -> GraphFile
mapBags f (GraphFile p) =
    GraphFile { p | bags = f p.bags }


getVertices : GraphFile -> List (Node VertexProperties)
getVertices (GraphFile { graph }) =
    Graph.nodes graph


getEdges : GraphFile -> List (Edge EdgeProperties)
getEdges (GraphFile { graph }) =
    Graph.edges graph


getBags : GraphFile -> List Bag
getBags (GraphFile { bags }) =
    bags
        |> Dict.map
            (\bagId bagProperties ->
                { bagId = bagId
                , bagProperties = bagProperties
                }
            )
        |> Dict.values


getBagProperties : BagId -> GraphFile -> Maybe BagProperties
getBagProperties bagId (GraphFile { bags }) =
    Dict.get bagId bags


updateBag : BagId -> (BagProperties -> BagProperties) -> GraphFile -> GraphFile
updateBag bagId up (GraphFile p) =
    GraphFile { p | bags = Dict.update bagId (Maybe.map up) p.bags }


updateDefaultVertexProperties : (VertexProperties -> VertexProperties) -> GraphFile -> GraphFile
updateDefaultVertexProperties up (GraphFile p) =
    GraphFile { p | defaultVertexProperties = up p.defaultVertexProperties }


updateDefaultEdgeProperties : (EdgeProperties -> EdgeProperties) -> GraphFile -> GraphFile
updateDefaultEdgeProperties up (GraphFile p) =
    GraphFile { p | defaultEdgeProperties = up p.defaultEdgeProperties }


updateVertices : Set VertexId -> (VertexProperties -> VertexProperties) -> GraphFile -> GraphFile
updateVertices vs up =
    mapGraph (Graph.Extra.updateNodes vs up)


updateEdges : Set EdgeId -> (EdgeProperties -> EdgeProperties) -> GraphFile -> GraphFile
updateEdges es up =
    mapGraph (Graph.Extra.updateEdges es up)


getCentroid : Set VertexId -> GraphFile -> Maybe Point2d
getCentroid vs (GraphFile { graph }) =
    graph
        |> Graph.nodes
        |> List.filterMap
            (\{ id, label } ->
                if Set.member id vs then
                    Just label.position

                else
                    Nothing
            )
        |> Point2d.centroid


setCentroidX : Set VertexId -> Float -> GraphFile -> GraphFile
setCentroidX vs newCentroidX user =
    let
        oldCentroidX =
            user |> getCentroid vs |> Maybe.map Point2d.xCoordinate |> Maybe.withDefault 0

        shift =
            Vector2d.fromComponents ( newCentroidX - oldCentroidX, 0 )
    in
    user |> updateVertices vs (\vP -> { vP | position = vP.position |> Point2d.translateBy shift })


setCentroidY : Set VertexId -> Float -> GraphFile -> GraphFile
setCentroidY vs newCentroidY user =
    let
        oldCentroidY =
            user |> getCentroid vs |> Maybe.map Point2d.yCoordinate |> Maybe.withDefault 0

        shift =
            Vector2d.fromComponents ( 0, newCentroidY - oldCentroidY )
    in
    user |> updateVertices vs (\vP -> { vP | position = vP.position |> Point2d.translateBy shift })


getVerticesInBag : BagId -> GraphFile -> Set VertexId
getVerticesInBag bagId (GraphFile { graph }) =
    let
        takeIfBagIdIsInBags { id, label } =
            if Set.member bagId label.inBags then
                Just id

            else
                Nothing
    in
    graph |> Graph.nodes |> List.filterMap takeIfBagIdIsInBags |> Set.fromList


getBagsWithVertices : GraphFile -> Dict BagId ( BagProperties, List ( VertexId, VertexProperties ) )
getBagsWithVertices (GraphFile { graph, bags }) =
    let
        cons id label bagId =
            Dict.update bagId (Maybe.map (Tuple.mapSecond ((::) ( id, label ))))

        handleVertex { id, label } acc =
            label.inBags |> Set.foldr (cons id label) acc

        initialAcc =
            bags |> Dict.map (\_ bP -> ( bP, [] ))
    in
    graph |> Graph.nodes |> List.foldr handleVertex initialAcc


addBag : Set VertexId -> GraphFile -> ( GraphFile, BagId )
addBag vs ((GraphFile p) as user) =
    let
        idOfTheNewBag =
            p.bags |> Dict.keys |> List.maximum |> Maybe.withDefault 0 |> (+) 1

        l =
            vs |> Set.toList |> List.map (\id -> ( id, () ))

        insertToBag _ vP =
            { vP | inBags = vP.inBags |> Set.insert idOfTheNewBag }
    in
    ( user
        |> mapGraph (Graph.Extra.updateNodesBy l insertToBag)
        |> mapBags
            (Dict.insert idOfTheNewBag
                { label = Nothing
                , color = Colors.white
                , hasConvexHull = True
                }
            )
    , idOfTheNewBag
    )


removeBag : BagId -> GraphFile -> GraphFile
removeBag bagId user =
    let
        removeFromBag vP =
            { vP | inBags = vP.inBags |> Set.remove bagId }
    in
    user
        |> mapGraph (Graph.mapNodes removeFromBag)
        |> mapBags (Dict.remove bagId)



--


getDefaultVertexProperties : GraphFile -> VertexProperties
getDefaultVertexProperties (GraphFile { defaultVertexProperties }) =
    defaultVertexProperties


getDefaultEdgeProperties : GraphFile -> EdgeProperties
getDefaultEdgeProperties (GraphFile { defaultEdgeProperties }) =
    defaultEdgeProperties


getCommonVertexProperty : Set VertexId -> (VertexProperties -> a) -> GraphFile -> Maybe a
getCommonVertexProperty vs prop (GraphFile { graph }) =
    Graph.Extra.getCommonNodeProperty vs prop graph


getCommonEdgeProperty : Set EdgeId -> (EdgeProperties -> a) -> GraphFile -> Maybe a
getCommonEdgeProperty vs prop (GraphFile { graph }) =
    Graph.Extra.getCommonEdgeProperty vs prop graph



--


getVertexProperties : VertexId -> GraphFile -> Maybe VertexProperties
getVertexProperties vertexId (GraphFile { graph }) =
    graph
        |> Graph.get vertexId
        |> Maybe.map (.node >> .label)


getVertexIdsWithPositions : Set VertexId -> GraphFile -> IntDict Point2d
getVertexIdsWithPositions s (GraphFile { graph }) =
    graph
        |> Graph.nodes
        |> List.filter (\{ id } -> Set.member id s)
        |> List.map (\{ id, label } -> ( id, label.position ))
        |> IntDict.fromList


vertexIdsInBoundingBox : BoundingBox2d -> GraphFile -> Set VertexId
vertexIdsInBoundingBox bB (GraphFile { graph }) =
    let
        vertexBB vertexProperties =
            vertexProperties.position
                |> Circle2d.withRadius vertexProperties.radius
                |> Circle2d.boundingBox
    in
    graph
        |> Graph.nodes
        |> List.filter (\{ label } -> BoundingBox2d.intersects bB (vertexBB label))
        |> List.map .id
        |> Set.fromList


lineSegmentOf : EdgeId -> GraphFile -> LineSegment2d
lineSegmentOf ( from, to ) user =
    let
        getPosition vertexId =
            user
                |> getVertexProperties vertexId
                |> Maybe.map .position
    in
    case ( getPosition from, getPosition to ) of
        ( Just p, Just q ) ->
            LineSegment2d.from p q

        _ ->
            -- Debug.log "The Gui shouldn't allow this"
            LineSegment2d.from Point2d.origin Point2d.origin


edgeIdsIntersectiongLineSegment : LineSegment2d -> GraphFile -> Set ( VertexId, VertexId )
edgeIdsIntersectiongLineSegment lS ((GraphFile { graph }) as user) =
    let
        intersects l1 l2 =
            case LineSegment2d.intersectionPoint l1 l2 of
                Just _ ->
                    True

                Nothing ->
                    False
    in
    graph
        |> Graph.edges
        |> List.filter (\{ from, to } -> intersects lS (lineSegmentOf ( from, to ) user))
        |> List.map (\{ from, to } -> ( from, to ))
        |> Set.fromList


getBoundingBoxWithMargin : Set VertexId -> GraphFile -> Maybe BoundingBox2d
getBoundingBoxWithMargin s user =
    let
        vertexBb id =
            user |> getVertexProperties id |> Maybe.map makeBb

        makeBb { position, radius } =
            position
                |> Circle2d.withRadius (radius + 4)
                |> Circle2d.boundingBox

        boundingBoxesOfvertices =
            s |> Set.toList |> List.filterMap vertexBb
    in
    BoundingBox2d.aggregate boundingBoxesOfvertices


inducedEdges : Set VertexId -> GraphFile -> Set ( VertexId, VertexId )
inducedEdges vs (GraphFile { graph }) =
    Graph.Extra.inducedEdges vs graph


inducedVertices : Set ( VertexId, VertexId ) -> Set VertexId
inducedVertices =
    Graph.Extra.inducedNodes



--


addVertex : Point2d -> GraphFile -> ( GraphFile, VertexId )
addVertex coordinates (GraphFile ({ defaultVertexProperties } as p)) =
    let
        propertiesOfTheNewVertex =
            { defaultVertexProperties | position = coordinates }

        ( newMyGraph, newId ) =
            p.graph |> Graph.Extra.insertNode propertiesOfTheNewVertex
    in
    ( GraphFile { p | graph = newMyGraph }
    , newId
    )


addEdge : EdgeId -> GraphFile -> GraphFile
addEdge edgeId ((GraphFile p) as user) =
    user |> mapGraph (Graph.Extra.insertEdge edgeId p.defaultEdgeProperties)


removeEdge : EdgeId -> GraphFile -> GraphFile
removeEdge edgeId =
    mapGraph (Graph.Extra.removeEdge edgeId)


contractEdge : EdgeId -> GraphFile -> GraphFile
contractEdge edgeId ((GraphFile p) as user) =
    let
        ( newGraph_, newId ) =
            p.graph
                |> Graph.Extra.contractEdge edgeId p.defaultVertexProperties

        midPoint =
            user |> lineSegmentOf edgeId |> LineSegment2d.midpoint

        setPos ({ node } as ctx) =
            let
                label =
                    node.label
            in
            { ctx | node = { node | label = { label | position = midPoint } } }

        newGraph =
            newGraph_ |> Graph.update newId (Maybe.map setPos)
    in
    GraphFile { p | graph = newGraph }


removeEdges : Set EdgeId -> GraphFile -> GraphFile
removeEdges s user =
    s |> Set.foldr removeEdge user


removeVertices : Set VertexId -> GraphFile -> GraphFile
removeVertices l (GraphFile p) =
    let
        rem vertexId acc =
            acc |> Graph.remove vertexId
    in
    GraphFile { p | graph = l |> Set.foldr rem p.graph }


divideEdge : Point2d -> EdgeId -> GraphFile -> ( GraphFile, VertexId )
divideEdge coordinates ( s, t ) user =
    let
        ( user_, newId ) =
            user |> addVertex coordinates
    in
    ( user_
        |> addEdge ( s, newId )
        |> addEdge ( newId, t )
        |> removeEdge ( s, t )
    , newId
    )


setVertexPositionsForGraph : List ( VertexId, Point2d ) -> MyGraph -> MyGraph
setVertexPositionsForGraph l =
    -- This is internal.
    Graph.Extra.updateNodesBy l (\pos vP -> { vP | position = pos })


setVertexPositions : List ( VertexId, Point2d ) -> GraphFile -> GraphFile
setVertexPositions l =
    mapGraph (setVertexPositionsForGraph l)


unionWithNewGraph :
    { graph : MyGraph
    , suggestedLayout : List ( VertexId, Point2d )
    }
    -> GraphFile
    -> GraphFile
unionWithNewGraph { graph, suggestedLayout } =
    -- this is internal!
    let
        graphWithSuggestedLayout =
            graph |> setVertexPositionsForGraph suggestedLayout
    in
    mapGraph
        (\oldGraph ->
            Graph.Extra.disjointUnion graphWithSuggestedLayout oldGraph |> .union
        )


addStarGraph : { numberOfLeaves : Int } -> GraphFile -> GraphFile
addStarGraph { numberOfLeaves } user =
    let
        starGraphWithLayout =
            Graph.Generators.star
                { numberOfLeaves = numberOfLeaves
                , vertexProperties = getDefaultVertexProperties user
                , edgeProperties = getDefaultEdgeProperties user
                }
    in
    unionWithNewGraph starGraphWithLayout user


duplicateSubgraph : Set VertexId -> Set ( VertexId, VertexId ) -> GraphFile -> ( GraphFile, Set VertexId, Set ( VertexId, VertexId ) )
duplicateSubgraph vs es ((GraphFile p) as user) =
    let
        ( newGraph, nvs, nes ) =
            p.graph |> Graph.Extra.duplicateSubgraph vs es
    in
    ( GraphFile { p | graph = newGraph }
    , Set.fromList nvs
    , Set.fromList nes
    )


pullCentersWithVertices : GraphFile -> Dict ( Float, Float ) (List VertexId)
pullCentersWithVertices (GraphFile { graph }) =
    Graph.nodes graph
        |> Dict.Extra.groupBy (.label >> .gravityCenter >> Point2d.coordinates)
        |> Dict.map (\_ nodeList -> List.map .id nodeList)
