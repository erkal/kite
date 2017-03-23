module Widgets.AddRemoveVerticesAndEdges exposing (..)

import Set exposing (Set)
import Dict exposing (Dict, insert)
import Html exposing (Html, div, span, text, p)
import Svg exposing (Svg, svg, circle, line, rect, path)
import Svg.Attributes exposing (strokeOpacity, transform, id, opacity, stroke, strokeLinecap, cx, cy, r, strokeWidth, x1, x2, y1, y2, width, height, cursor, fill)
import Svg.Events exposing (onMouseDown, onMouseOver, onMouseOut, on, onMouseUp)
import Json.Decode exposing (Decoder)
import Mouse
import Keyboard
import PanAndZoom.Basics as PB exposing (ScaleAndTranslate)
import BasicGeometry exposing (Point)
import Digraph exposing (VertexName, EdgeName)


widgetName : String
widgetName =
    "Add/Remove"


explanations : String
explanations =
    """
    To add a vertex, click on the background.
    To add an edge, drag.
    To remove a vertex or edge, click on it whilst holding the alt key.
    """



-- MODEL


type alias Model =
    { state : State
    , vertexNamePrefix : String
    , vertexProp : Digraph.VertexProp
    , edgeProp : Digraph.EdgeProp
    }


type State
    = ReadyToAdd
    | DraggingEdge
        { source : VertexName
        , endOfHalfEdge : Point
        }
    | ReadyToRemove Selection


type Selection
    = NoSelection
    | E EdgeName
    | V VertexName


initialModel : Model
initialModel =
    { state = ReadyToAdd
    , vertexNamePrefix = "vertex"
    , vertexProp = Digraph.standardVertexProp
    , edgeProp = Digraph.standardEdgeProp
    }



-- UPDATE


type Msg
    = NoOp
    | StartDraggingEdge { source : VertexName, endOfHalfEdge : Point }
    | DragEdge { source : VertexName, endOfHalfEdge : Point }
    | FinishEdge { source : VertexName, target : VertexName }
    | CancelDraggingEdge
    | GetReadyToAdd
    | CallAddVertex ( Float, Float )
    | SetReadyToRemove Selection
    | CallRemoveEdge EdgeName
    | CallRemoveVertex VertexName


createNewVertexName : String -> Set String -> String
createNewVertexName suggestedName existingNames =
    let
        try : Int -> String
        try i =
            let
                nameToTry =
                    suggestedName ++ "-" ++ toString i
            in
                if Set.member nameToTry existingNames then
                    try (i + 1)
                else
                    nameToTry
    in
        if Set.member suggestedName existingNames then
            try 0
        else
            suggestedName


update : Msg -> Digraph.Model -> Model -> ( Model, Maybe Digraph.Msg )
update msg graph ({ state, vertexNamePrefix, vertexProp } as model) =
    case msg of
        NoOp ->
            ( model, Nothing )

        StartDraggingEdge sourceAndEndOfHalfEdge ->
            ( { model | state = DraggingEdge sourceAndEndOfHalfEdge }, Nothing )

        DragEdge d ->
            ( { model | state = DraggingEdge d }, Nothing )

        FinishEdge { source, target } ->
            ( { model | state = ReadyToAdd }
            , Just
                (Digraph.AddEdge
                    { source = source
                    , target = target
                    , edgeProp = Digraph.standardEdgeProp
                    }
                )
            )

        CancelDraggingEdge ->
            ( { model | state = ReadyToAdd }, Nothing )

        CallAddVertex xy ->
            let
                existingVertexIds =
                    graph.vertices |> Dict.keys |> Set.fromList

                newVertexId =
                    createNewVertexName vertexNamePrefix existingVertexIds

                propertiesOfTheNewVertex =
                    { vertexName = newVertexId
                    , vertexProp = { vertexProp | position = xy }
                    }
            in
                ( model, Just (Digraph.AddVertex propertiesOfTheNewVertex) )

        SetReadyToRemove selection ->
            ( { model | state = ReadyToRemove selection }, Nothing )

        GetReadyToAdd ->
            ( { model | state = ReadyToAdd }, Nothing )

        CallRemoveEdge n ->
            ( model, Just (Digraph.RemoveEdges { edgeNames = [ n ] }) )

        CallRemoveVertex n ->
            ( model, Just (Digraph.RemoveVertices { vertexNames = [ n ] }) )



-- SUBSCRIPTIONS


subscriptions : Digraph.Model -> Model -> Sub Msg
subscriptions { scaleAndTranslate } model =
    Sub.batch
        [ case model.state of
            DraggingEdge { source } ->
                let
                    positionToMsg p =
                        DragEdge
                            { source = source
                            , endOfHalfEdge =
                                p
                                    |> BasicGeometry.toPoint
                                    |> PB.applyToPoint (PB.inverse scaleAndTranslate)
                            }
                in
                    Sub.batch
                        [ Mouse.moves positionToMsg
                        , Mouse.ups (\_ -> CancelDraggingEdge)
                        ]

            otherwise ->
                Sub.none
        , Keyboard.downs
            (\keyCode ->
                if keyCode == 18 then
                    -- 18 is the key code of the alt key
                    SetReadyToRemove NoSelection
                else
                    NoOp
            )
        , Keyboard.ups
            (\keyCode ->
                if keyCode == 18 then
                    -- 18 is the key code of the alt key
                    GetReadyToAdd
                else
                    NoOp
            )
        ]



--VIEW


view : Model -> Digraph.Model -> { layoutWidth : Int, layoutHeight : Int } -> Html Msg
view model graph sizes =
    Svg.g []
        [ drawInteractionRectForAddVertex model sizes graph
        , Svg.g
            [ transform (PB.extractTransformForSvg graph.scaleAndTranslate) ]
            [ drawInvisibleEdgeHandles model graph
            , drawHalfEdge model graph
            , drawInvisibleVertexHandles model graph
            ]
        ]


drawInvisibleEdgeHandles : Model -> Digraph.Model -> Html Msg
drawInvisibleEdgeHandles model graph =
    let
        es =
            graph.edges
                |> Dict.map (drawEdgeHandle model graph)
                |> Dict.values
    in
        Svg.g [ id "edge-handles-for-removal" ] es


drawEdgeHandle : Model -> Digraph.Model -> EdgeName -> Digraph.EdgeProp -> Html Msg
drawEdgeHandle model graph ( s, t ) { color, thickness } =
    let
        doIfInRemoveMode foo =
            case model.state of
                ReadyToRemove _ ->
                    foo

                otherwise ->
                    NoOp
    in
        case ( Dict.get s graph.vertices, Dict.get t graph.vertices ) of
            ( Just v, Just w ) ->
                line
                    [ stroke color
                    , strokeWidth (toString (4 * thickness))
                    , strokeOpacity "0"
                    , cursor "pointer"
                    , x1 (toString (Tuple.first v.position))
                    , y1 (toString (Tuple.second v.position))
                    , x2 (toString (Tuple.first w.position))
                    , y2 (toString (Tuple.second w.position))
                    , onMouseOver (doIfInRemoveMode (SetReadyToRemove (E ( s, t ))))
                    , onMouseDown (doIfInRemoveMode (CallRemoveEdge ( s, t )))
                    , onMouseOut (doIfInRemoveMode (SetReadyToRemove NoSelection))
                    ]
                    []

            otherwise ->
                Debug.crash ""


drawInteractionRectForAddVertex : Model -> { layoutWidth : Int, layoutHeight : Int } -> Digraph.Model -> Html Msg
drawInteractionRectForAddVertex model { layoutWidth, layoutHeight } { scaleAndTranslate } =
    let
        positionToMsg =
            BasicGeometry.toPoint
                >> PB.applyToPoint (PB.inverse scaleAndTranslate)
                >> CallAddVertex

        events =
            case model.state of
                ReadyToAdd ->
                    [ on "click" (Mouse.position |> Json.Decode.map positionToMsg) ]

                otherwise ->
                    []
    in
        rect
            ([ width (toString layoutWidth)
             , height (toString layoutHeight)
             , fill "red"
             , opacity "0"
             ]
                ++ events
            )
            []


drawInvisibleVertexHandles : Model -> Digraph.Model -> Html Msg
drawInvisibleVertexHandles model graph =
    let
        positionToMsg v p =
            StartDraggingEdge
                { source = v
                , endOfHalfEdge =
                    p
                        |> BasicGeometry.toPoint
                        |> PB.applyToPoint (PB.inverse graph.scaleAndTranslate)
                }

        drawVertex v { position, radius } =
            let
                events =
                    case model.state of
                        ReadyToAdd ->
                            [ on "mousedown" (Mouse.position |> Json.Decode.map (positionToMsg v)) ]

                        DraggingEdge { source } ->
                            [ onMouseUp (FinishEdge { source = source, target = v }) ]

                        otherwise ->
                            []

                isTheVertexToRemove =
                    case model.state of
                        ReadyToRemove (V vertexName) ->
                            vertexName == v

                        otherwise ->
                            False

                doIfInRemoveMode foo =
                    case model.state of
                        ReadyToRemove _ ->
                            foo

                        otherwise ->
                            NoOp
            in
                circle
                    ([ cx (toString (Tuple.first position))
                     , cy (toString (Tuple.second position))
                     , r (toString (2 * radius))
                     , strokeWidth "4px"
                     , cursor "pointer"
                     , opacity "0"
                     , onMouseOver (doIfInRemoveMode (SetReadyToRemove (V v)))
                     , onMouseDown (doIfInRemoveMode (CallRemoveVertex v))
                     , onMouseOut (doIfInRemoveMode (SetReadyToRemove NoSelection))
                     ]
                        ++ events
                    )
                    []

        vs =
            graph.vertices
                |> Dict.map drawVertex
                |> Dict.values
    in
        Svg.g [ id "vertex-handles-for-edge-drawing" ] vs


drawHalfEdge : Model -> Digraph.Model -> Html Msg
drawHalfEdge model graph =
    case model.state of
        DraggingEdge { source, endOfHalfEdge } ->
            let
                ( x1_, y1_ ) =
                    case graph.vertices |> Dict.get source of
                        Nothing ->
                            Debug.crash ""

                        Just { position } ->
                            position

                ( x2_, y2_ ) =
                    endOfHalfEdge
            in
                Svg.line
                    [ x1 (toString x1_)
                    , y1 (toString y1_)
                    , x2 (toString x2_)
                    , y2 (toString y2_)
                    , stroke "#ffae00"
                    , strokeWidth "3px"
                    , strokeLinecap "round"
                    ]
                    []

        otherwise ->
            Svg.g [] []


viewMenu : a -> Html Msg
viewMenu model =
    div []
        [ p [] [ Html.text explanations ] ]
