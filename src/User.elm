module User exposing
    ( BagDict
    , BagId
    , BagProperties
    , EdgeId
    , EdgeProperties
    , MyGraph
    , User
    , VertexId
    , VertexProperties
    , addBag
    , addEdge
    , addVertex
    , contractEdge
    , default
    , divideEdge
    , duplicateSubgraph
    , edgeIdsIntersectiongLineSegment
    , getBagProperties
    , getBags
    , getBagsWithVertices
    , getBoundingBoxWithMargin
    , getCentroid
    , getCommonEdgeProperty
    , getCommonVertexProperty
    , getDefaultEdgeProperties
    , getDefaultVertexProperties
    , getEdges
    , getVertexIdsWithPositions
    , getVertexProperties
    , getVertices
    , getVerticesInBag
    , inducedEdges
    , inducedVertices
    , removeBag
    , removeEdges
    , removeVertices
    , setCentroidX
    , setCentroidY
    , setVertexPositions
    , simulation
    , tick
    , updateBag
    , updateDefaultEdgeProperties
    , updateDefaultVertexProperties
    , updateEdges
    , updateVertices
    , vertexIdsInBoundingBox
    )

import BoundingBox2d exposing (BoundingBox2d)
import Circle2d exposing (Circle2d)
import Colors
import Dict exposing (Dict)
import Element exposing (Color)
import Force exposing (Force, ForceGraph)
import Graph exposing (Edge, Graph, Node, NodeContext, NodeId)
import Graph.Extra
import IntDict exposing (IntDict)
import LineSegment2d exposing (LineSegment2d)
import Point2d exposing (Point2d)
import Set exposing (Set)
import Vector2d exposing (Vector2d)


{-| This type holds the data that the user can (and should) have when exporting or importing graphs.
The GUI-state data does not enter here!
Everything about the GUI is in Main.elm.
-}
type User
    = User
        { graph : MyGraph
        , bags : BagDict
        , forces : List Force
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
    { position : Point2d
    , velocity : Vector2d
    , strength : Float
    , fixed : Bool
    , color : Color
    , radius : Float
    , inBags : Set BagId
    , label : Maybe String
    , labelIsVisible : Bool
    }


type alias EdgeProperties =
    { distance : Float
    , strength : Float
    , color : Color
    , thickness : Float
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
    { hasConvexHull : Bool
    , pullCenter : Point2d
    , pullStrength : Float
    }


default : User
default =
    User
        { graph = Graph.empty
        , bags = Dict.empty
        , forces =
            [ Force.ManyBody 0.9
            , Force.Link
            ]
        , defaultVertexProperties =
            { position = Point2d.origin
            , velocity = Vector2d.zero
            , strength = -60
            , color = Colors.lightGray
            , radius = 5
            , inBags = Set.empty
            , fixed = False
            , label = Nothing
            , labelIsVisible = False
            }
        , defaultEdgeProperties =
            { color = Colors.lightGray
            , thickness = 3
            , distance = 40
            , strength = 0.7
            }
        }


defaultBagProperties : BagProperties
defaultBagProperties =
    { hasConvexHull = False
    , pullStrength = 0.1
    , pullCenter = Point2d.fromCoordinates ( 300, 300 )
    }


simulation : User -> Force.State
simulation (User { forces }) =
    Force.simulation forces


tick : Force.State -> User -> ( Force.State, User )
tick state (User p) =
    let
        ( newState, newGraph ) =
            Force.tick state p.graph
    in
    ( newState, User { p | graph = newGraph } )


mapGraph : (MyGraph -> MyGraph) -> User -> User
mapGraph f (User p) =
    User { p | graph = f p.graph }


mapBags : (BagDict -> BagDict) -> User -> User
mapBags f (User p) =
    User { p | bags = f p.bags }


getVertices : User -> List (Node VertexProperties)
getVertices (User { graph }) =
    graph |> Graph.nodes


getEdges : User -> List (Edge EdgeProperties)
getEdges (User { graph }) =
    graph |> Graph.edges


getBags : User -> List Bag
getBags (User { bags }) =
    bags
        |> Dict.map
            (\bagId bagProperties ->
                { bagId = bagId
                , bagProperties = bagProperties
                }
            )
        |> Dict.values


getBagProperties : BagId -> User -> Maybe BagProperties
getBagProperties bagId (User { bags }) =
    Dict.get bagId bags


updateBag : BagId -> (BagProperties -> BagProperties) -> User -> User
updateBag bagId up (User p) =
    User { p | bags = Dict.update bagId (Maybe.map up) p.bags }


updateDefaultVertexProperties : (VertexProperties -> VertexProperties) -> User -> User
updateDefaultVertexProperties up (User p) =
    User { p | defaultVertexProperties = up p.defaultVertexProperties }


updateDefaultEdgeProperties : (EdgeProperties -> EdgeProperties) -> User -> User
updateDefaultEdgeProperties up (User p) =
    User { p | defaultEdgeProperties = up p.defaultEdgeProperties }


updateVertices : Set VertexId -> (VertexProperties -> VertexProperties) -> User -> User
updateVertices vs up =
    mapGraph (Graph.Extra.updateNodes vs up)


updateEdges : Set EdgeId -> (EdgeProperties -> EdgeProperties) -> User -> User
updateEdges es up =
    mapGraph (Graph.Extra.updateEdges es up)


getCentroid : Set VertexId -> User -> Maybe Point2d
getCentroid vs (User { graph }) =
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


setCentroidX : Set VertexId -> Float -> User -> User
setCentroidX vs newCentroidX user =
    let
        oldCentroidX =
            user |> getCentroid vs |> Maybe.map Point2d.xCoordinate |> Maybe.withDefault 0

        shift =
            Vector2d.fromComponents ( newCentroidX - oldCentroidX, 0 )
    in
    user |> updateVertices vs (\vP -> { vP | position = vP.position |> Point2d.translateBy shift })


setCentroidY : Set VertexId -> Float -> User -> User
setCentroidY vs newCentroidY user =
    let
        oldCentroidY =
            user |> getCentroid vs |> Maybe.map Point2d.yCoordinate |> Maybe.withDefault 0

        shift =
            Vector2d.fromComponents ( 0, newCentroidY - oldCentroidY )
    in
    user |> updateVertices vs (\vP -> { vP | position = vP.position |> Point2d.translateBy shift })


getVerticesInBag : BagId -> User -> Set VertexId
getVerticesInBag bagId (User { graph }) =
    let
        takeIfBagIdIsInBags { id, label } =
            if Set.member bagId label.inBags then
                Just id

            else
                Nothing
    in
    graph |> Graph.nodes |> List.filterMap takeIfBagIdIsInBags |> Set.fromList


getBagsWithVertices : User -> Dict BagId ( BagProperties, List ( VertexId, VertexProperties ) )
getBagsWithVertices (User { graph, bags }) =
    let
        cons id label bagId =
            Dict.update bagId (Maybe.map (Tuple.mapSecond ((::) ( id, label ))))

        handleVertex { id, label } acc =
            label.inBags |> Set.foldr (cons id label) acc

        initialAcc =
            bags |> Dict.map (\_ bP -> ( bP, [] ))
    in
    graph |> Graph.nodes |> List.foldr handleVertex initialAcc


addBag : Set VertexId -> User -> ( User, BagId )
addBag vs ((User p) as user) =
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
        |> mapBags (Dict.insert idOfTheNewBag defaultBagProperties)
    , idOfTheNewBag
    )


removeBag : BagId -> User -> User
removeBag bagId user =
    let
        removeFromBag vP =
            { vP | inBags = vP.inBags |> Set.remove bagId }
    in
    user
        |> mapGraph (Graph.mapNodes removeFromBag)
        |> mapBags (Dict.remove bagId)



--


getDefaultEdgeProperties : User -> EdgeProperties
getDefaultEdgeProperties (User { defaultEdgeProperties }) =
    defaultEdgeProperties


getDefaultVertexProperties : User -> VertexProperties
getDefaultVertexProperties (User { defaultVertexProperties }) =
    defaultVertexProperties


getCommonVertexProperty : Set VertexId -> (VertexProperties -> a) -> User -> Maybe a
getCommonVertexProperty vs prop (User { graph }) =
    Graph.Extra.getCommonNodeProperty vs prop graph


getCommonEdgeProperty : Set EdgeId -> (EdgeProperties -> a) -> User -> Maybe a
getCommonEdgeProperty vs prop (User { graph }) =
    Graph.Extra.getCommonEdgeProperty vs prop graph



--


getVertexProperties : VertexId -> User -> Maybe VertexProperties
getVertexProperties vertexId (User { graph }) =
    graph
        |> Graph.get vertexId
        |> Maybe.map (.node >> .label)


getVertexIdsWithPositions : Set VertexId -> User -> IntDict Point2d
getVertexIdsWithPositions s (User { graph }) =
    graph
        |> Graph.nodes
        |> List.filter (\{ id } -> Set.member id s)
        |> List.map (\{ id, label } -> ( id, label.position ))
        |> IntDict.fromList


vertexIdsInBoundingBox : BoundingBox2d -> User -> Set VertexId
vertexIdsInBoundingBox bB (User { graph }) =
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


lineSegmentOf : EdgeId -> User -> LineSegment2d
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


edgeIdsIntersectiongLineSegment : LineSegment2d -> User -> Set ( VertexId, VertexId )
edgeIdsIntersectiongLineSegment lS ((User { graph }) as user) =
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


getBoundingBoxWithMargin : Set VertexId -> User -> Maybe BoundingBox2d
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


inducedEdges : Set VertexId -> User -> Set ( VertexId, VertexId )
inducedEdges vs (User { graph }) =
    Graph.Extra.inducedEdges vs graph


inducedVertices : Set ( VertexId, VertexId ) -> Set VertexId
inducedVertices =
    Graph.Extra.inducedNodes



--


addVertex : Point2d -> User -> ( User, VertexId )
addVertex coordinates (User ({ defaultVertexProperties } as p)) =
    let
        propertiesOfTheNewVertex =
            { defaultVertexProperties | position = coordinates }

        ( newMyGraph, newId ) =
            p.graph |> Graph.Extra.insertNode propertiesOfTheNewVertex
    in
    ( User { p | graph = newMyGraph }
    , newId
    )


addEdge : EdgeId -> User -> User
addEdge edgeId ((User p) as user) =
    user |> mapGraph (Graph.Extra.insertEdge edgeId p.defaultEdgeProperties)


removeEdge : EdgeId -> User -> User
removeEdge edgeId =
    mapGraph (Graph.Extra.removeEdge edgeId)


contractEdge : EdgeId -> User -> User
contractEdge edgeId ((User p) as user) =
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
    User { p | graph = newGraph }


removeEdges : Set EdgeId -> User -> User
removeEdges s user =
    s |> Set.foldr removeEdge user


removeVertices : Set VertexId -> User -> User
removeVertices l (User p) =
    let
        rem vertexId acc =
            acc |> Graph.remove vertexId
    in
    User { p | graph = l |> Set.foldr rem p.graph }


divideEdge : Point2d -> EdgeId -> User -> ( User, VertexId )
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


setVertexPositions : List ( VertexId, Point2d ) -> User -> User
setVertexPositions l =
    mapGraph (Graph.Extra.updateNodesBy l (\pos vP -> { vP | position = pos }))


duplicateSubgraph : Set VertexId -> Set ( VertexId, VertexId ) -> User -> ( User, Set VertexId, Set ( VertexId, VertexId ) )
duplicateSubgraph vs es ((User p) as user) =
    let
        ( newGraph, nvs, nes ) =
            p.graph |> Graph.Extra.duplicateSubgraph vs es
    in
    ( User { p | graph = newGraph }
    , Set.fromList nvs
    , Set.fromList nes
    )
