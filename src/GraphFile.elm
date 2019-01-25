module GraphFile exposing
    ( GraphFile
    , MyGraph, VertexId, VertexProperties, LabelPosition(..), EdgeId, EdgeProperties
    , Bag, BagDict, BagId, BagProperties
    , default, defaultVertexProp, defaultEdgeProp
    , decoder
    , encode
    , setGraph
    , updateVertices, addVertex, removeVertices
    , updateEdges, addEdge, removeEdges
    , contractEdge, divideEdge
    , addBag, removeBag, updateBag
    , addStarGraph
    , duplicateSubgraph
    , setCentroidX, setCentroidY, setVertexPositions
    , topologicalSort
    , getGraph
    , getVertices, getVertexProperties, getVerticesInBag, getVertexIdsWithPositions, pullCentersWithVertices
    , getEdges
    , inducedEdges, inducedVertices
    , getBagProperties, getBags, getBagsWithVertices
    , getCommonEdgeProperty, getCommonVertexProperty
    , getCentroid, getBoundingBoxWithMargin, vertexIdsInBoundingBox, edgeIdsIntersectiongLineSegment
    , getDefaultEdgeProperties, getDefaultVertexProperties
    , updateDefaultEdgeProperties, updateDefaultVertexProperties
    , forceTick, transitionGraphFile
    )

{-| This module separates the graph data from the GUI state. All the graph data which is not a GUI state lives here. In addition the default vertex and edge properties live in the same `GraphFile` type.
This module also contains operations acting on graphs needed bei the Main module. Note that the interaction of the Main module with `MyGraph` type happens only by these operators. The Main module does not import `Graph` or `MyGraph`.


# Definition

@docs GraphFile
@docs MyGraph, VertexId, VertexProperties, LabelPosition, EdgeId, EdgeProperties
@docs Bag, BagDict, BagId, BagProperties


# Defaults

@docs default, defaultVertexProp, defaultEdgeProp


# Decoder

@docs decoder


# Decoder

@docs encode


# Graph Operations

@docs setGraph
@docs updateVertices, addVertex, removeVertices
@docs updateEdges, addEdge, removeEdges
@docs contractEdge, divideEdge
@docs addBag, removeBag, updateBag
@docs addStarGraph
@docs duplicateSubgraph
@docs setCentroidX, setCentroidY, setVertexPositions
@docs topologicalSort


# Graph Queries

@docs getGraph
@docs getVertices, getVertexProperties, getVerticesInBag, getVertexIdsWithPositions, pullCentersWithVertices
@docs getEdges
@docs inducedEdges, inducedVertices
@docs getBagProperties, getBags, getBagsWithVertices
@docs getCommonEdgeProperty, getCommonVertexProperty
@docs getCentroid, getBoundingBoxWithMargin, vertexIdsInBoundingBox, edgeIdsIntersectiongLineSegment


# Accessing Default Properties

@docs getDefaultEdgeProperties, getDefaultVertexProperties
@docs updateDefaultEdgeProperties, updateDefaultVertexProperties


# Animation Related Operations

@docs forceTick, transitionGraphFile


## Internals

unionWithNewGraph, setVertexPositionsForGraph

-}

import BoundingBox2d exposing (BoundingBox2d)
import Circle2d exposing (Circle2d)
import Colors
import Dict exposing (Dict)
import Dict.Extra
import Ease exposing (Easing)
import Element exposing (Color)
import Graph exposing (Edge, Graph, Node, NodeContext, NodeId)
import Graph.Decode
import Graph.Encode
import Graph.Extra
import Graph.Force as Force exposing (Force, ForceGraph)
import Graph.Generators
import Graph.Layout
import IntDict exposing (IntDict)
import Json.Decode as JD exposing (Decoder, Value)
import Json.Decode.Pipeline as JDP
import Json.Encode as JE exposing (Value)
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
    , labelSize : Float
    , labelPosition : LabelPosition
    , labelColor : Color
    , labelIsVisible : Bool
    , position : Point2d
    , velocity : Vector2d
    , manyBodyStrength : Float
    , gravityCenter : Point2d
    , gravityStrengthX : Float
    , gravityStrengthY : Float
    , fixed : Bool
    , color : Color
    , radius : Float
    , borderColor : Color
    , borderWidth : Float
    , opacity : Float
    , inBags : Set BagId
    }


type LabelPosition
    = LabelTopLeft
    | LabelTop
    | LabelTopRight
    | LabelLeft
    | LabelCenter
    | LabelRight
    | LabelBottomLeft
    | LabelBottom
    | LabelBottomRight


type alias EdgeProperties =
    { label : Maybe String
    , labelSize : Float
    , labelColor : Color
    , labelIsVisible : Bool
    , distance : Float
    , strength : Float
    , thickness : Float
    , color : Color
    , opacity : Float
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



--------------
-- Defaults --
--------------


default : GraphFile
default =
    GraphFile
        { graph = Graph.empty
        , bags = Dict.empty
        , defaultVertexProperties = defaultVertexProp
        , defaultEdgeProperties = defaultEdgeProp
        }


defaultVertexProp : VertexProperties
defaultVertexProp =
    { label = Nothing
    , labelSize = 12
    , labelPosition = LabelTop
    , labelColor = Colors.white
    , labelIsVisible = True
    , position = Point2d.origin
    , velocity = Vector2d.zero
    , gravityCenter = Point2d.fromCoordinates ( 300, 200 )
    , gravityStrengthX = 0.05
    , gravityStrengthY = 0.05
    , manyBodyStrength = -100
    , color = Colors.darkGray
    , radius = 8
    , borderColor = Colors.mainSvgBackground
    , borderWidth = 0
    , opacity = 1
    , inBags = Set.empty
    , fixed = False
    }


defaultEdgeProp : EdgeProperties
defaultEdgeProp =
    { label = Nothing
    , labelSize = 12
    , labelColor = Colors.lightGray
    , labelIsVisible = True
    , color = Colors.darkGray
    , thickness = 3
    , distance = 50
    , strength = 0.7
    , opacity = 1
    }



-------------
-- Encoder --
-------------


encode : GraphFile -> Value
encode gF =
    JE.object
        [ ( "graph", encodeMyGraph (getGraph gF) )
        , ( "bags", encodeBags (getBags gF) )
        , ( "defaultVertexProperties"
          , encodeVertexProperties (getDefaultVertexProperties gF)
          )
        , ( "defaultEdgeProperties"
          , encodeEdgeProperties (getDefaultEdgeProperties gF)
          )
        ]


encodeMyGraph : MyGraph -> Value
encodeMyGraph =
    Graph.Encode.graph
        encodeVertexProperties
        encodeEdgeProperties


encodeBags : List Bag -> Value
encodeBags =
    JE.list encodeBag


encodeBag : Bag -> Value
encodeBag b =
    JE.object
        [ ( "bagId", JE.int b.bagId )
        , ( "bagProperties", encodeBagProperties b.bagProperties )
        ]


encodeBagProperties : BagProperties -> Value
encodeBagProperties bP =
    JE.object
        [ ( "label", encodeMaybeString bP.label )
        , ( "color", Colors.encode bP.color )
        , ( "hasConvexHull", JE.bool bP.hasConvexHull )
        ]


encodeVertexProperties : VertexProperties -> Value
encodeVertexProperties vP =
    JE.object
        [ ( "label", encodeMaybeString vP.label )
        , ( "labelSize", JE.float vP.labelSize )
        , ( "labelPosition", encodeLabelPosition vP.labelPosition )
        , ( "labelColor", Colors.encode vP.labelColor )
        , ( "labelIsVisible", JE.bool vP.labelIsVisible )
        , ( "position", encodePoint2d vP.position )
        , ( "velocity", encodeVector2d vP.velocity )
        , ( "manyBodyStrength", JE.float vP.manyBodyStrength )
        , ( "gravityCenter", encodePoint2d vP.gravityCenter )
        , ( "gravityStrengthX", JE.float vP.gravityStrengthX )
        , ( "gravityStrengthY", JE.float vP.gravityStrengthY )
        , ( "fixed", JE.bool vP.fixed )
        , ( "color", Colors.encode vP.color )
        , ( "radius", JE.float vP.radius )
        , ( "borderColor", Colors.encode vP.color )
        , ( "borderWidth", JE.float vP.borderWidth )
        , ( "opacity", JE.float vP.opacity )
        , ( "inBags", JE.list JE.int (Set.toList vP.inBags) )
        ]


encodeLabelPosition : LabelPosition -> Value
encodeLabelPosition lP =
    JE.string <|
        case lP of
            LabelTopLeft ->
                "LabelTopLeft"

            LabelTop ->
                "LabelTop"

            LabelTopRight ->
                "LabelTopRight"

            LabelLeft ->
                "LabelLeft"

            LabelCenter ->
                "LabelCenter"

            LabelRight ->
                "LabelRight"

            LabelBottomLeft ->
                "LabelBottomLeft"

            LabelBottom ->
                "LabelBottom"

            LabelBottomRight ->
                "LabelBottomRight"


encodeEdgeProperties : EdgeProperties -> Value
encodeEdgeProperties eP =
    JE.object
        [ ( "label", encodeMaybeString eP.label )
        , ( "labelSize", JE.float eP.labelSize )
        , ( "labelColor", Colors.encode eP.labelColor )
        , ( "labelIsVisible", JE.bool eP.labelIsVisible )
        , ( "distance", JE.float eP.distance )
        , ( "strength", JE.float eP.strength )
        , ( "thickness", JE.float eP.thickness )
        , ( "color", Colors.encode eP.color )
        , ( "opacity", JE.float eP.opacity )
        ]


encodeMaybeString : Maybe String -> Value
encodeMaybeString maybeStr =
    case maybeStr of
        Just str ->
            JE.string str

        Nothing ->
            JE.null


encodePoint2d : Point2d -> Value
encodePoint2d p =
    JE.object
        [ ( "xCoordinate", JE.float (Point2d.xCoordinate p) )
        , ( "yCoordinate", JE.float (Point2d.yCoordinate p) )
        ]


encodeVector2d : Vector2d -> Value
encodeVector2d v =
    JE.object
        [ ( "xComponent", JE.float (Vector2d.xComponent v) )
        , ( "yComponent", JE.float (Vector2d.yComponent v) )
        ]



-------------
-- Decoder --
-------------


decoder : Decoder GraphFile
decoder =
    JD.map4
        (\a b c d ->
            GraphFile
                { graph = a
                , bags = b
                , defaultVertexProperties = c
                , defaultEdgeProperties = d
                }
        )
        (JD.field "graph" myGraphDecoder)
        (JD.field "bags" bagsDecoder)
        (JD.field "defaultVertexProperties" vertexPropertiesDecoder)
        (JD.field "defaultEdgeProperties" edgePropertiesDecoder)


myGraphDecoder : Decoder MyGraph
myGraphDecoder =
    Graph.Decode.graph
        vertexPropertiesDecoder
        edgePropertiesDecoder


bagsDecoder : Decoder BagDict
bagsDecoder =
    JD.map Dict.fromList (JD.list bagDecoder)


bagDecoder : Decoder ( BagId, BagProperties )
bagDecoder =
    JD.map2 Tuple.pair
        (JD.field "bagId" JD.int)
        (JD.field "bagProperties" bagPropertiesDecoder)


bagPropertiesDecoder : Decoder BagProperties
bagPropertiesDecoder =
    JD.map3 BagProperties
        (JD.field "label" (JD.nullable JD.string))
        (JD.field "color" Colors.decoder)
        (JD.field "hasConvexHull" JD.bool)


vertexPropertiesDecoder : Decoder VertexProperties
vertexPropertiesDecoder =
    JD.succeed VertexProperties
        |> JDP.required "label" (JD.nullable JD.string)
        |> JDP.required "labelSize" JD.float
        |> JDP.required "labelPosition" labelPositionDecoder
        |> JDP.required "labelColor" Colors.decoder
        |> JDP.required "labelIsVisible" JD.bool
        |> JDP.required "position" point2dDecoder
        |> JDP.required "velocity" vector2dDecoder
        |> JDP.required "manyBodyStrength" JD.float
        |> JDP.required "gravityCenter" point2dDecoder
        |> JDP.required "gravityStrengthX" JD.float
        |> JDP.required "gravityStrengthY" JD.float
        |> JDP.required "fixed" JD.bool
        |> JDP.required "color" Colors.decoder
        |> JDP.required "radius" JD.float
        |> JDP.required "borderColor" Colors.decoder
        |> JDP.required "borderWidth" JD.float
        |> JDP.required "opacity" JD.float
        |> JDP.required "inBags" (JD.map Set.fromList (JD.list JD.int))


labelPositionDecoder : Decoder LabelPosition
labelPositionDecoder =
    JD.map
        (\str ->
            case str of
                "LabelTopLeft" ->
                    LabelTopLeft

                "LabelTop" ->
                    LabelTop

                "LabelTopRight" ->
                    LabelTopRight

                "LabelLeft" ->
                    LabelLeft

                "LabelCenter" ->
                    LabelCenter

                "LabelRight" ->
                    LabelRight

                "LabelBottomLeft" ->
                    LabelBottomLeft

                "LabelBottom" ->
                    LabelBottom

                "LabelBottomRight" ->
                    LabelBottomRight

                _ ->
                    -- This never happens
                    LabelBottomLeft
        )
        JD.string


edgePropertiesDecoder : Decoder EdgeProperties
edgePropertiesDecoder =
    JD.succeed EdgeProperties
        |> JDP.required "label" (JD.nullable JD.string)
        |> JDP.required "labelSize" JD.float
        |> JDP.required "labelColor" Colors.decoder
        |> JDP.required "labelIsVisible" JD.bool
        |> JDP.required "distance" JD.float
        |> JDP.required "strength" JD.float
        |> JDP.required "thickness" JD.float
        |> JDP.required "color" Colors.decoder
        |> JDP.required "opacity" JD.float


point2dDecoder : Decoder Point2d
point2dDecoder =
    JD.map Point2d.fromCoordinates <|
        JD.map2 Tuple.pair
            (JD.field "xCoordinate" JD.float)
            (JD.field "yCoordinate" JD.float)


vector2dDecoder : Decoder Vector2d
vector2dDecoder =
    JD.map Vector2d.fromComponents <|
        JD.map2 Tuple.pair
            (JD.field "xComponent" JD.float)
            (JD.field "yComponent" JD.float)



--


getGraph : GraphFile -> MyGraph
getGraph (GraphFile { graph }) =
    graph


mapGraph : (MyGraph -> MyGraph) -> GraphFile -> GraphFile
mapGraph f (GraphFile p) =
    GraphFile { p | graph = f p.graph }


setGraph : MyGraph -> GraphFile -> GraphFile
setGraph g =
    mapGraph (always g)


mapBags : (BagDict -> BagDict) -> GraphFile -> GraphFile
mapBags f (GraphFile p) =
    GraphFile { p | bags = f p.bags }


removeAllBags : GraphFile -> GraphFile
removeAllBags =
    mapBags (always Dict.empty)


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
    Graph.nodes graph
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

        shiftPos vP =
            { vP | position = vP.position |> Point2d.translateBy shift }
    in
    user |> updateVertices vs shiftPos


setCentroidY : Set VertexId -> Float -> GraphFile -> GraphFile
setCentroidY vs newCentroidY user =
    let
        oldCentroidY =
            user |> getCentroid vs |> Maybe.map Point2d.yCoordinate |> Maybe.withDefault 0

        shift =
            Vector2d.fromComponents ( 0, newCentroidY - oldCentroidY )

        shiftPos vP =
            { vP | position = vP.position |> Point2d.translateBy shift }
    in
    user |> updateVertices vs shiftPos


setLabelSize : Set VertexId -> Float -> GraphFile -> GraphFile
setLabelSize vs newLabelSize user =
    let
        up vP =
            { vP | labelSize = newLabelSize }
    in
    user |> updateVertices vs up


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
            Debug.todo "The Gui shouldn't allow this" <|
                LineSegment2d.from Point2d.origin Point2d.origin


edgeIdsIntersectiongLineSegment : LineSegment2d -> GraphFile -> Set ( VertexId, VertexId )
edgeIdsIntersectiongLineSegment lS ((GraphFile { graph }) as user) =
    let
        intersects l1 l2 =
            LineSegment2d.intersectionPoint l1 l2 /= Nothing
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
    Graph.Extra.updateNodesBy l
        --(\pos vP ->
        --    { label = vP.label
        --    , labelSize = vP.labelSize
        --    , labelPosition = vP.labelPosition
        --    , labelColor = vP.labelColor
        --    , labelIsVisible = vP.labelIsVisible
        --    , position = pos
        --    , velocity = vP.velocity
        --    , gravityCenter = vP.gravityCenter
        --    , gravityStrengthX = vP.gravityStrengthX
        --    , gravityStrengthY = vP.gravityStrengthY
        --    , manyBodyStrength = vP.manyBodyStrength
        --    , color = vP.color
        --    , radius = vP.radius
        --    , borderColor = vP.borderColor
        --    , borderWidth = vP.borderWidth
        --    , opacity = vP.opacity
        --    , inBags = vP.inBags
        --    , fixed = vP.fixed
        --    }
        --)
        (\pos vP -> { vP | position = pos })


setVertexPositions : List ( VertexId, Point2d ) -> GraphFile -> GraphFile
setVertexPositions l =
    mapGraph (setVertexPositionsForGraph l)


topologicalSort : GraphFile -> GraphFile
topologicalSort =
    let
        lineToSortAlong =
            LineSegment2d.fromEndpoints
                ( Point2d.fromCoordinates ( 50, 50 )
                , Point2d.fromCoordinates ( 50, 750 )
                )

        assignGravity =
            Graph.mapNodes
                (\vP ->
                    { vP
                        | gravityCenter =
                            Point2d.fromCoordinates
                                ( 300
                                , Point2d.yCoordinate vP.position
                                )
                        , gravityStrengthX = 0.005
                        , gravityStrengthY = 0.2
                        , manyBodyStrength = -100
                    }
                )
                >> Graph.mapEdges (\eP -> { eP | strength = 0.01 })
    in
    mapGraph (Graph.Layout.topological lineToSortAlong >> assignGravity)


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
            .result
                (Graph.Extra.disjointUnion graphWithSuggestedLayout oldGraph)
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



----------------------------------
-- Animation Related Operations --
----------------------------------


forceTick : Force.State -> GraphFile -> ( Force.State, GraphFile )
forceTick forceState (GraphFile p) =
    let
        ( newForceState, newGraph ) =
            Force.tick forceState p.graph
    in
    ( newForceState, GraphFile { p | graph = newGraph } )


transitionGraphFile : Float -> { start : GraphFile, end : GraphFile } -> GraphFile
transitionGraphFile elapsedTimeRatio { start, end } =
    let
        eTR =
            -- elapsed time
            -- in order to prevent flickering at the very end of tranition we clamp it.
            clamp 0 1 elapsedTimeRatio

        { result, nodeSeparation, edgeSeparation } =
            Graph.Extra.union (getGraph start) (getGraph end)

        ( verticesInStartButNotInEnd, verticesInIntersection, verticesInEndButNotInStart ) =
            nodeSeparation

        upVerticesInStartButNotInEnd =
            Graph.Extra.updateNodes
                (verticesInStartButNotInEnd
                    |> List.map .id
                    |> Set.fromList
                )
                (\vP ->
                    { vP
                        | radius =
                            Ease.reverse Ease.inCubic eTR
                                * vP.radius
                        , labelSize =
                            Ease.reverse Ease.inCubic eTR
                                * vP.labelSize
                        , borderWidth =
                            Ease.reverse Ease.inCubic eTR
                                * vP.borderWidth
                    }
                )

        upVerticesInEndButNotInStart =
            Graph.Extra.updateNodes
                (verticesInEndButNotInStart
                    |> List.map .id
                    |> Set.fromList
                )
                (\vP ->
                    { vP
                        | radius =
                            Ease.inCubic eTR * vP.radius
                        , labelSize =
                            Ease.inCubic eTR * vP.labelSize
                        , borderWidth =
                            Ease.inCubic eTR * vP.borderWidth
                    }
                )

        upVerticesInIntersection =
            Graph.Extra.updateNodesBy
                (verticesInIntersection
                    |> List.map (\{ id, label } -> ( id, label ))
                )
                (\endVertex startVertex ->
                    vertexTransition eTR
                        startVertex
                        endVertex
                )

        ( edgesInStartButNotInEnd, edgesInIntersection, edgesInEndButNotInStart ) =
            edgeSeparation

        upEdgesInStartButNotInEnd =
            Graph.Extra.updateEdges
                (edgesInStartButNotInEnd
                    |> List.map (\{ from, to } -> ( from, to ))
                    |> Set.fromList
                )
                (\eP ->
                    { eP
                        | thickness =
                            (1 - Ease.outQuint eTR) * eP.thickness
                        , labelSize =
                            Ease.reverse Ease.inCubic eTR * eP.labelSize
                    }
                )

        upEdgesInEndButNotInStart =
            Graph.Extra.updateEdges
                (edgesInEndButNotInStart
                    |> List.map (\{ from, to } -> ( from, to ))
                    |> Set.fromList
                )
                (\eP ->
                    { eP
                        | thickness = Ease.inQuint eTR * eP.thickness
                        , labelSize = Ease.inCubic eTR * eP.labelSize
                    }
                )

        upEdgesInIntersection =
            Graph.Extra.updateEdgesBy
                (edgesInIntersection
                    |> List.map (\{ from, to, label } -> ( ( from, to ), label ))
                )
                (\endEdge startEdge ->
                    edgeTransition eTR
                        startEdge
                        endEdge
                )
    in
    end
        |> removeAllBags
        |> setGraph
            (result
                |> upVerticesInStartButNotInEnd
                |> upVerticesInEndButNotInStart
                |> upVerticesInIntersection
                |> upEdgesInStartButNotInEnd
                |> upEdgesInEndButNotInStart
                |> upEdgesInIntersection
            )


vertexTransition : Float -> VertexProperties -> VertexProperties -> VertexProperties
vertexTransition eTR startVertex endVertex =
    { startVertex
        | position =
            startVertex.position
                |> Point2d.translateBy
                    (Vector2d.scaleBy (Ease.inOutCubic eTR)
                        (Vector2d.from startVertex.position endVertex.position)
                    )
        , radius =
            startVertex.radius
                + (eTR * (endVertex.radius - startVertex.radius))
        , label =
            if eTR < 0.5 then
                startVertex.label

            else
                endVertex.label
        , labelSize =
            if startVertex.label == endVertex.label then
                startVertex.labelSize
                    + (eTR * (endVertex.labelSize - startVertex.labelSize))

            else if eTR < 0.5 then
                startVertex.labelSize * Ease.reverse Ease.inCubic (2 * eTR)

            else
                endVertex.labelSize * Ease.inCubic (2 * (eTR - 0.5))
        , labelColor =
            Colors.linearTransition eTR
                startVertex.labelColor
                endVertex.labelColor
        , borderWidth =
            startVertex.borderWidth
                + (eTR * (endVertex.borderWidth - startVertex.borderWidth))
        , borderColor =
            Colors.linearTransition eTR
                startVertex.borderColor
                endVertex.borderColor
        , opacity =
            startVertex.opacity
                + (eTR * (endVertex.opacity - startVertex.opacity))
        , color =
            Colors.linearTransition eTR
                startVertex.color
                endVertex.color
    }


edgeTransition : Float -> EdgeProperties -> EdgeProperties -> EdgeProperties
edgeTransition eTR startEdge endEdge =
    { startEdge
        | thickness =
            startEdge.thickness
                + (eTR * (endEdge.thickness - startEdge.thickness))
        , label =
            if eTR < 0.5 then
                startEdge.label

            else
                endEdge.label
        , labelSize =
            if startEdge.label == endEdge.label then
                startEdge.labelSize
                    + (eTR * (endEdge.labelSize - startEdge.labelSize))

            else if eTR < 0.5 then
                startEdge.labelSize * Ease.reverse Ease.inCubic (2 * eTR)

            else
                endEdge.labelSize * Ease.inCubic (2 * (eTR - 0.5))
        , labelColor =
            Colors.linearTransition eTR
                startEdge.labelColor
                endEdge.labelColor
        , color =
            Colors.linearTransition eTR startEdge.color endEdge.color
        , opacity =
            startEdge.opacity
                + (eTR * (endEdge.opacity - startEdge.opacity))
    }
