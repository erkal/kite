module Widgets.SelectAndEdit exposing (..)

import Set exposing (Set)
import Dict exposing (Dict)
import Html exposing (..)
import Html.Attributes exposing (type_, style, value)
import Html.Events exposing (onClick, onInput)
import Svg exposing (circle, rect)
import Svg.Attributes exposing (transform, x, y, cx, cy, r, stroke, strokeWidth, strokeDasharray, fillOpacity, id, opacity, cursor)
import Svg.Events exposing (on, onMouseDown)
import Json.Decode exposing (Decoder)
import Mouse
import Keyboard
import Time exposing (Time, second)
import AnimationFrame
import Animation exposing (..)
import Material.Icons.Action as MIA
import Material.Icons.Content as MIC
import Material.Icons.Editor as MIE
import BasicGeometry exposing (Position, Point, toPoint)
import PanAndZoom.Basics as PB exposing (ScaleAndTranslate)
import GraphLayout exposing (..)
import Digraph exposing (VertexName, EdgeName)
import Digraph.Operations
import HtmlHelpers exposing (myMaterialButton)


widgetName : String
widgetName =
    "Select and Edit"


explanations : String
explanations =
    """
    To select vertices drag a rectangle.
    To add vertices to the selection, click on them or while holding the shift key drag a rectangle.
    To remove vertices from the selection, hold the alt key and drag a rectangle.
    To move the selected vertices, drag the selection.
    To copy-and-drag the selected vertices, drag the selection, by holding the shift key pressed.
    """



-- MODEL


type alias Model =
    { time : Time
    , state : State
    , selectedVertices : Set VertexName
    , clipBoard : Digraph.Model
    , altKeyIsPressed : Bool
    , shiftKeyIsPressed : Bool
    }


type State
    = Idle
    | ScalingRect
        { dragStartPoint : Point
        , currentMousePoint : Point
        }
    | DraggingVertices
        { dragStartPoint : Point
        , vertexPositionsAtDragStart :
            List { vertexName : VertexName, position : Point }
        , currentMousePoint : Point
        }
    | Animating
        { coordinates : List { vertexName : VertexName, startPoint : Point, endPoint : Point }
        , animation : Animation
        }


initialModel : Model
initialModel =
    { time = 0
    , state = Idle
    , selectedVertices = Set.empty
    , clipBoard = Digraph.empty
    , altKeyIsPressed = False
    , shiftKeyIsPressed = False
    }



-- UPDATE


type Msg
    = NoOp
    | SwitchToVertices
    | SwitchToEdges
    | AddToSelected VertexName
    | SetSelectedVertices (Set VertexName)
    | RemoveFromSelection VertexName
    | RemoveSelectedVerticesFromTheGraph
    | SetRadius Float
    | ChangeVertexColor String
    | Lay GraphLayout.Layout
    | LayWithAnimation GraphLayout.Layout
    | StartSelectionRect Point
    | DragSelectionRect Point
    | StopDraggingSelectionRect
    | StartDraggingVertices Point
    | MaybeDraggingVertices Point
    | StopDraggingVertices
    | Tick Time
    | CopySelectionToClipBoard
    | PasteFromClipBoard
    | ShiftDown
    | ShiftUp
    | AltDown
    | AltUp
    | StartCopyDraggingVertices Point


type CallToFileSystem
    = PauseRecording
    | ResumeRecording
    | NoCall


update : Msg -> Digraph.Model -> Model -> ( Model, Maybe Digraph.Msg, CallToFileSystem )
update msg graph ({ selectedVertices } as model) =
    case msg of
        NoOp ->
            ( model, Nothing, NoCall )

        SwitchToVertices ->
            {- TODO -}
            ( model, Nothing, NoCall )

        SwitchToEdges ->
            {- TODO -}
            ( model, Nothing, NoCall )

        StartDraggingVertices p ->
            let
                newModel =
                    { model
                        | state =
                            DraggingVertices
                                { dragStartPoint = p
                                , vertexPositionsAtDragStart =
                                    graph.vertices
                                        |> Dict.filter (\name _ -> Set.member name selectedVertices)
                                        |> Dict.map (\k v -> { vertexName = k, position = v.position })
                                        |> Dict.values
                                , currentMousePoint = p
                                }
                    }
            in
                ( newModel
                , Nothing
                , PauseRecording
                )

        MaybeDraggingVertices p ->
            let
                newModel =
                    { model
                        | state =
                            case model.state of
                                DraggingVertices d ->
                                    DraggingVertices { d | currentMousePoint = p }

                                otherwise ->
                                    model.state
                    }

                toFloats { x, y } =
                    { x = toFloat x
                    , y = toFloat y
                    }

                digraphMsg =
                    case model.state of
                        DraggingVertices { dragStartPoint, vertexPositionsAtDragStart, currentMousePoint } ->
                            let
                                delta =
                                    BasicGeometry.diff currentMousePoint dragStartPoint

                                increase v =
                                    { v | position = BasicGeometry.add v.position delta }
                            in
                                Just (Digraph.MoveVertices (List.map increase vertexPositionsAtDragStart))

                        otherwise ->
                            Nothing
            in
                ( newModel
                , digraphMsg
                , NoCall
                )

        StopDraggingVertices ->
            ( { model | state = Idle }
            , Nothing
            , ResumeRecording
            )

        AddToSelected vertexName ->
            ( { model | selectedVertices = selectedVertices |> Set.insert vertexName }
            , Nothing
            , NoCall
            )

        SetSelectedVertices vertexSet ->
            ( { model | selectedVertices = vertexSet }
            , Nothing
            , NoCall
            )

        RemoveFromSelection vertexName ->
            ( { model | selectedVertices = selectedVertices |> Set.remove vertexName }
            , Nothing
            , NoCall
            )

        RemoveSelectedVerticesFromTheGraph ->
            ( model
            , Just (Digraph.RemoveVertices { vertexNames = Set.toList selectedVertices })
            , NoCall
            )

        SetRadius r ->
            ( model
            , Just (Digraph.SetRadius { newRadius = r, vertexNames = Set.toList selectedVertices })
            , NoCall
            )

        ChangeVertexColor color ->
            ( model
            , Just (Digraph.SetColor { newColor = color, vertexNames = Set.toList selectedVertices })
            , NoCall
            )

        Lay layout ->
            ( model
            , Just
                (Digraph.MoveVertices
                    (graph.vertices
                        |> Dict.filter (\name _ -> Set.member name selectedVertices)
                        |> Dict.map (\_ v -> v.position)
                        |> GraphLayout.lay layout
                        |> Dict.map (\name pos -> { vertexName = name, position = pos })
                        |> Dict.values
                    )
                )
            , NoCall
            )

        LayWithAnimation layout ->
            ( { model
                | state =
                    Animating
                        { animation = Animation.animation model.time
                        , coordinates =
                            let
                                startPositions =
                                    graph.vertices
                                        |> Dict.filter (\name _ -> Set.member name selectedVertices)
                                        |> Dict.map (\_ v -> v.position)

                                endPositions =
                                    startPositions |> GraphLayout.lay layout
                            in
                                graph.vertices
                                    |> Dict.filter (\name _ -> Set.member name selectedVertices)
                                    |> Dict.map
                                        (\n v ->
                                            { vertexName = n
                                            , startPoint = v.position
                                            , endPoint = endPositions |> Dict.get n |> Maybe.withDefault v.position
                                            }
                                        )
                                    |> Dict.values
                        }
              }
            , Nothing
            , PauseRecording
            )

        StartSelectionRect p ->
            ( { model
                | state =
                    ScalingRect
                        { dragStartPoint = p
                        , currentMousePoint = p
                        }
              }
            , Nothing
            , NoCall
            )

        DragSelectionRect p ->
            ( { model
                | state =
                    case model.state of
                        ScalingRect d ->
                            ScalingRect { d | currentMousePoint = p }

                        otherwise ->
                            Idle
              }
            , Nothing
            , NoCall
            )

        StopDraggingSelectionRect ->
            case model.state of
                ScalingRect { dragStartPoint, currentMousePoint } ->
                    let
                        currentRect =
                            BasicGeometry.findRect dragStartPoint currentMousePoint

                        inCurrentRect position =
                            BasicGeometry.inRect currentRect position
                    in
                        ( { model
                            | state = Idle
                            , selectedVertices =
                                graph.vertices
                                    |> Dict.filter
                                        (\vn { position } ->
                                            if model.altKeyIsPressed then
                                                Set.member vn selectedVertices && not (inCurrentRect position)
                                            else if model.shiftKeyIsPressed then
                                                Set.member vn selectedVertices || inCurrentRect position
                                            else
                                                inCurrentRect position
                                        )
                                    |> Dict.keys
                                    |> Set.fromList
                          }
                        , Nothing
                        , NoCall
                        )

                otherwise ->
                    ( model, Nothing, NoCall )

        Tick time ->
            case model.state of
                (Animating { animation, coordinates }) as s ->
                    if Animation.isDone model.time animation then
                        ( { model | time = time, state = Idle }
                        , Nothing
                        , ResumeRecording
                        )
                    else
                        ( { model | time = time }
                        , let
                            k =
                                Animation.animate model.time animation

                            calculateNewCoordinate { vertexName, startPoint, endPoint } =
                                case ( startPoint, endPoint ) of
                                    ( ( sx, sy ), ( ex, ey ) ) ->
                                        { vertexName = vertexName
                                        , position =
                                            ( sx + k * (ex - sx)
                                            , sy + k * (ey - sy)
                                            )
                                        }
                          in
                            Just (Digraph.MoveVertices (List.map calculateNewCoordinate coordinates))
                        , NoCall
                        )

                otherwise ->
                    ( { model | time = time }
                    , Nothing
                    , NoCall
                    )

        CopySelectionToClipBoard ->
            ( { model | clipBoard = graph |> Digraph.Operations.induce model.selectedVertices }
            , Nothing
            , NoCall
            )

        PasteFromClipBoard ->
            ( { model | selectedVertices = model.clipBoard |> Digraph.getVertices |> Dict.keys |> List.map ((++) "1-") |> Set.fromList }
            , Just (Digraph.ReplaceBy (Digraph.Operations.union graph model.clipBoard))
            , NoCall
            )

        ShiftDown ->
            ( { model | shiftKeyIsPressed = True }
            , Nothing
            , NoCall
            )

        ShiftUp ->
            ( { model | shiftKeyIsPressed = False }
            , Nothing
            , NoCall
            )

        AltDown ->
            ( { model | altKeyIsPressed = True }
            , Nothing
            , NoCall
            )

        AltUp ->
            ( { model | altKeyIsPressed = False }
            , Nothing
            , NoCall
            )

        StartCopyDraggingVertices p ->
            let
                ( m1, mdm, _ ) =
                    model
                        |> update CopySelectionToClipBoard graph
                        |> (\( m, _, _ ) -> m)
                        |> update PasteFromClipBoard graph

                ( m2, _, c ) =
                    case mdm of
                        Just dm ->
                            m1 |> update (StartDraggingVertices p) (graph |> Digraph.update dm)

                        Nothing ->
                            Debug.crash ""
            in
                ( m2, mdm, c )



-- SUBSCRIPTIONS


correct scaleAndTranslate =
    toPoint >> PB.applyToPoint (PB.inverse scaleAndTranslate)


subscriptions : Model -> ScaleAndTranslate -> Sub Msg
subscriptions model scaleAndTranslate =
    Sub.batch
        (AnimationFrame.times Tick
            :: (case model.state of
                    ScalingRect _ ->
                        [ Mouse.moves (correct scaleAndTranslate >> DragSelectionRect)
                        , Mouse.ups (\_ -> StopDraggingSelectionRect)
                        ]

                    DraggingVertices _ ->
                        [ Mouse.moves (correct scaleAndTranslate >> MaybeDraggingVertices)
                        , Mouse.ups (\_ -> StopDraggingVertices)
                        ]

                    Idle ->
                        [ Keyboard.downs
                            (\keyCode ->
                                if keyCode == 16 then
                                    -- 16 is the key code of the shift key
                                    ShiftDown
                                else if keyCode == 18 then
                                    -- 18 is the key code of the alt key
                                    AltDown
                                else
                                    NoOp
                            )
                        , Keyboard.ups
                            (\keyCode ->
                                if keyCode == 16 then
                                    -- 16 is the key code of the shift key
                                    ShiftUp
                                else if keyCode == 18 then
                                    -- 18 is the key code of the alt key
                                    AltUp
                                else
                                    NoOp
                            )
                        ]

                    otherwise ->
                        []
               )
        )



-- VIEW


view : Model -> Digraph.Model -> { layoutWidth : Int, layoutHeight : Int } -> Html Msg
view model graph sizes =
    Svg.g []
        [ interactionRect graph sizes
        , Svg.g
            [ transform (PB.extractTransformForSvg graph.scaleAndTranslate) ]
            [ drawSelectionRectangle model
            , drawVertexHandles model graph
            ]
        ]


interactionRect : Digraph.Model -> { layoutWidth : Int, layoutHeight : Int } -> Html Msg
interactionRect graph { layoutWidth, layoutHeight } =
    rect
        [ Svg.Attributes.width (toString layoutWidth)
        , Svg.Attributes.height (toString layoutHeight)
        , Svg.Attributes.opacity "0"
        , on "mousedown"
            (Mouse.position
                |> Json.Decode.map (correct graph.scaleAndTranslate >> StartSelectionRect)
            )
        ]
        []


drawSelectionRectangle : Model -> Html Msg
drawSelectionRectangle model =
    Svg.g [ id "vertex-selectors-interaction-layer-for-rectangle-selection" ]
        [ case model.state of
            ScalingRect { dragStartPoint, currentMousePoint } ->
                case BasicGeometry.findRect dragStartPoint currentMousePoint of
                    BasicGeometry.Rect { position, width, height } ->
                        rect
                            [ x (toString (Tuple.first position))
                            , y (toString (Tuple.second position))
                            , Svg.Attributes.width (toString width)
                            , Svg.Attributes.height (toString height)
                            , stroke "white"
                            , strokeWidth "2px"
                            , cursor "cross"
                            , fillOpacity "0.5"
                            , strokeDasharray "5, 5"
                            ]
                            []

            otherwise ->
                Svg.g [] []
        ]


drawVertexHandles : Model -> Digraph.Model -> Html Msg
drawVertexHandles { state, selectedVertices, shiftKeyIsPressed, altKeyIsPressed } graph =
    let
        drawVertex vertexName { position, radius } =
            let
                isSelected =
                    Set.member vertexName selectedVertices

                onMouseDownDecMsg : Decoder Msg
                onMouseDownDecMsg =
                    if isSelected then
                        if shiftKeyIsPressed then
                            Mouse.position |> Json.Decode.map (correct graph.scaleAndTranslate >> StartCopyDraggingVertices)
                        else
                            Mouse.position |> Json.Decode.map (correct graph.scaleAndTranslate >> StartDraggingVertices)
                    else
                        Json.Decode.succeed (AddToSelected vertexName)

                ( x_, y_ ) =
                    position
            in
                circle
                    [ cx (toString x_)
                    , cy (toString y_)
                    , r (toString (radius + 2))
                    , stroke "#fffb00"
                    , strokeWidth
                        (if isSelected then
                            "4px"
                         else
                            "0px"
                        )
                    , fillOpacity "0"
                    , on "mousedown" onMouseDownDecMsg
                    ]
                    []

        vs =
            graph.vertices
                |> Dict.map drawVertex
                |> Dict.values
    in
        Svg.g [ id "vertex-handles-for-selecting" ]
            vs


viewMenu : Model -> Html Msg
viewMenu model =
    let
        leftPad =
            "100px"

        myInputCollection formName content =
            div
                [ Html.Attributes.style
                    [ ( "margin-top", "10px" )
                    , ( "border-top", "1px solid #CCC" )
                    , ( "padding", "10px" )
                    ]
                ]
                (p []
                    [ u [] [ Html.text formName ] ]
                    :: content
                )

        myDiv =
            div [ Html.Attributes.style [ ( "margin-top", "1em" ) ] ]

        myLabel =
            label
                [ Html.Attributes.style
                    [ ( "display", "inline-block" )
                    , ( "width", leftPad )
                    , ( "text-align", "right" )
                    ]
                ]

        it =
            [ ( "margin-left", ".5em" )
            , ( "font", "1em sans-serif" )
            , ( "width", "50px" )
            , ( "box-sizing", "border-box" )
            , ( "border", "1px solid #999" )
            ]

        myInput s =
            input (s ++ [ Html.Attributes.style it ])

        myTextArea s =
            textarea
                (s
                    ++ [ Html.Attributes.style
                            (it
                                ++ [ ( "vertical-align", "top" )
                                   , ( "height", "5em" )
                                   ]
                            )
                       ]
                )

        myButtonDiv =
            div
                [ Html.Attributes.style
                    [ ( "margin-top", "1em" )
                    , ( "padding-left", leftPad )
                    ]
                ]

        myButton s =
            button (s ++ [ Html.Attributes.style [ ( "type", "button" ), ( "margin", ".5em" ) ] ])
    in
        div []
            [ p [] [ Html.text explanations ]
            , myInputCollection "general"
                [ p []
                    [ myMaterialButton "Copy" MIC.content_copy CopySelectionToClipBoard
                    , myMaterialButton "Paste" MIC.content_paste PasteFromClipBoard
                    , myMaterialButton "Delete" MIA.delete RemoveSelectedVerticesFromTheGraph
                    ]
                ]
            , myInputCollection "align"
                [ p []
                    [ myMaterialButton "Bottom" MIE.vertical_align_bottom (LayWithAnimation (GraphLayout.Align GraphLayout.Bottom))
                    , myMaterialButton "Top" MIE.vertical_align_top (LayWithAnimation (GraphLayout.Align GraphLayout.Top))
                    , myMaterialButton "Left" MIE.format_align_left (LayWithAnimation (GraphLayout.Align GraphLayout.Left))
                    , myMaterialButton "Right" MIE.format_align_right (LayWithAnimation (GraphLayout.Align GraphLayout.Right))
                    ]
                ]
            , myInputCollection "distribute"
                [ p []
                    [ myButton
                        [ onClick (LayWithAnimation GraphLayout.HorizontallyEquidistant) ]
                        [ text "Horizontally" ]
                    , myButton
                        [ onClick (LayWithAnimation GraphLayout.VerticallyEquidistant) ]
                        [ text "Vertically" ]
                    ]
                ]
            , myInputCollection "change vertex properties"
                [ myDiv
                    [ myLabel [ text "radius:" ]
                    , myInput
                        [ type_ "number"
                        , Html.Attributes.min "2"
                        , Html.Attributes.max "30"
                        , onInput (String.toFloat >> Result.withDefault 6 >> SetRadius)
                        ]
                        []
                    ]
                , myDiv
                    [ myLabel [ text "color:" ]
                    , myInput [ type_ "color", onInput ChangeVertexColor ] []
                    ]
                , myButtonDiv [ myButton [] [ text "ExampleButton" ] ]
                ]
            , myInputCollection "change edge properties"
                [ myDiv
                    [ myLabel [ text "coming soon..." ]
                      --, myInput
                      --    [ type_ "number"
                      --    , Html.Attributes.min "2"
                      --    , Html.Attributes.max "30"
                      --    ]
                      --    []
                    ]
                ]
            ]
