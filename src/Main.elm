port module Main exposing (main)

import Browser
import Browser.Dom as Dom
import Browser.Events
import CheckBox
import ColorPicker
import Colors exposing (Color)
import ConvexHull
import Dict exposing (Dict)
import Graph exposing (BagId, EdgeId, Graph, VertexId)
import Html as H exposing (Html, div)
import Html.Attributes as HA
import Html.Events as HE
import Icons exposing (icons)
import Json.Decode as Decode exposing (Decoder, Value)
import Set exposing (Set)
import Svg as S
import Svg.Attributes as SA
import Svg.Events as SE
import Task


main : Program () Model Msg
main =
    Browser.document
        { init =
            always
                ( initialModel
                , Cmd.batch
                    [ Task.perform UpdateWindowSize (Task.map getWindowSize Dom.getViewport)
                    ]
                )
        , view = \model -> { title = "Kite", body = [ view model ] }
        , update = update
        , subscriptions = subscriptions
        }


getWindowSize viewPort =
    { width = round viewPort.scene.width
    , height = round viewPort.scene.height
    }


port fromD3TickData : (TickData -> msg) -> Sub msg


type alias TickData =
    { alpha : Float
    , nodes : List { id : VertexId, x : Float, y : Float }
    }


port toD3GraphData : Value -> Cmd msg


port toD3RestartWithAlpha : Float -> Cmd msg


port toD3StopSimulation : () -> Cmd msg


port toD3DragStart : List { id : VertexId, x : Float, y : Float } -> Cmd msg


port toD3Drag : List { id : VertexId, x : Float, y : Float } -> Cmd msg


port toD3DragEnd : () -> Cmd msg



-- MODEL


type alias Model =
    { windowSize : { width : Int, height : Int }
    , graph : Graph
    , tool : Tool
    , leftBarContent : LeftBarContent
    , selector : Selector
    , vaderIsOn : Bool
    , highlightingVertexOnMouseOver : Maybe VertexId
    , highlightingEdgeOnMouseOver : Maybe EdgeId
    , highlightingBagOnMouseOver : Maybe BagId
    , highlightingPullCenterOnMouseOver : Maybe BagId
    , selectedVertices : Set VertexId
    , selectedEdges : Set EdgeId
    , vertexPreferences : Graph.Vertex
    , edgePreferences : Graph.Edge
    , maybeSelectedBag : Maybe BagId
    , bagPreferences : Graph.Bag
    , alpha : Float
    }


type LeftBarContent
    = Preferences
    | ListsOfBagsVerticesAndEdges
    | GraphOperations
    | GraphQueries
    | GraphGenerators
    | AlgorithmVisualizations
    | GamesOnGraphs


type Selector
    = RectSelector
    | LineSelector


type Tool
    = Draw (Maybe EdgeBrush)
    | Select SelectState


type alias EdgeBrush =
    { sourceId : VertexId
    , mousePos : { x : Int, y : Int }
    }


type SelectState
    = Idle
    | BrushingForSelection Brush
    | DraggingSelection (List { id : VertexId, x : Float, y : Float }) Brush
    | DraggingPullCenter BagId { x : Float, y : Float } Brush


type alias Brush =
    { start : { x : Int, y : Int }
    , mousePos : { x : Int, y : Int }
    }


initialModel : Model
initialModel =
    { windowSize = { width = 800, height = 600 }
    , graph = Graph.empty
    , tool = Draw Nothing
    , leftBarContent = ListsOfBagsVerticesAndEdges
    , selector = RectSelector
    , vaderIsOn = True
    , highlightingVertexOnMouseOver = Nothing
    , highlightingEdgeOnMouseOver = Nothing
    , highlightingBagOnMouseOver = Nothing
    , highlightingPullCenterOnMouseOver = Nothing
    , selectedVertices = Set.empty
    , selectedEdges = Set.empty
    , vertexPreferences =
        { x = 200
        , y = 200
        , fixed = False
        , color = "white"
        , radius = 5
        , inBags = Set.empty
        , userDefinedProperties = Dict.empty
        }
    , edgePreferences =
        { color = "white"
        , thickness = 2
        , distance = 50
        , strength = 0.5
        }
    , maybeSelectedBag = Nothing
    , bagPreferences =
        { hasConvexHull = False
        , pullIsActive = False
        , draggablePullCenter = False
        , pullX = 600
        , pullXStrength = 0.04
        , pullY = 300
        , pullYStrength = 0.04
        }
    , alpha = 0
    }



-- UPDATE


type Msg
    = NoOp
    | UpdateWindowSize { width : Int, height : Int }
    | DrawToolClicked
    | SelectToolClicked
    | RectSelectorClicked
    | LineSelectorClicked
    | MouseMove { x : Int, y : Int }
    | MouseUp { x : Int, y : Int }
    | MouseDownOnTransparentInteractionRect { x : Int, y : Int }
    | MouseUpOnTransparentInteractionRect { x : Int, y : Int }
    | MouseDownOnVertex VertexId { x : Int, y : Int }
    | MouseDownOnEdge EdgeId { x : Int, y : Int }
    | MouseOverVertex VertexId
    | MouseOverEdge EdgeId
    | MouseOutVertex VertexId
    | MouseOutEdge EdgeId
    | MouseUpOnVertex VertexId
    | MouseUpOnEdge EdgeId { x : Int, y : Int }
    | FromD3Tick TickData
    | VaderClicked
    | FromVertexColorPicker Color
    | FromEdgeColorPicker Color
    | FromFixedCheckBox Bool
    | FromConvexHullCheckBox Bool
    | FromPullIsActiveCheckBox Bool
    | FromDraggableCenterCheckBox Bool
    | FromPullXStrengthInput String
    | FromPullYStrengthInput String
    | FromPullXInput String
    | FromPullYInput String
    | FromRadiusInput String
    | FromThicknessInput String
    | FromDistanceInput String
    | FromStrengthInput String
    | FromManyBodyStrengthInput String
    | FromManyBodyThetaInput String
    | FromManyBodyMinDistanceInput String
    | FromManyBodyMaxDistanceInput String
    | FromYInput String
    | FromXInput String
    | ClickOnVertexTrash
    | ClickOnBagTrash
    | ClickOnEdgeTrash
    | ClickOnEdgeContract
    | ClickOnBagPlus
    | MouseOverVertexItem VertexId
    | MouseOverEdgeItem EdgeId
    | MouseOverBagItem BagId
    | MouseOverPullCenter BagId
    | MouseOutVertexItem VertexId
    | MouseOutEdgeItem EdgeId
    | MouseOutBagItem BagId
    | MouseOutPullCenter BagId
    | ClickOnVertexItem VertexId
    | ClickOnEdgeItem EdgeId
    | ClickOnBagItem BagId
    | ClickOnPullCenter BagId
    | MouseDownOnPullCenter BagId { x : Int, y : Int }
    | ThinBarButtonClicked LeftBarContent


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    let
        sendGraphData : Graph -> Cmd msg
        sendGraphData graph =
            toD3GraphData (Graph.encodeForD3 graph)

        reheatSimulationIfVaderIsOn : Cmd msg
        reheatSimulationIfVaderIsOn =
            if m.vaderIsOn then
                toD3RestartWithAlpha 0.6

            else
                Cmd.none
    in
    case msg of
        NoOp ->
            ( m
            , Cmd.none
            )

        UpdateWindowSize wS ->
            ( { m | windowSize = wS }
            , Cmd.none
            )

        DrawToolClicked ->
            ( { m
                | tool = Draw Nothing
                , selectedVertices = Set.empty
                , selectedEdges = Set.empty
              }
            , Cmd.none
            )

        SelectToolClicked ->
            ( { m | tool = Select Idle }
            , Cmd.none
            )

        RectSelectorClicked ->
            ( { m
                | selector = RectSelector
                , tool = Select Idle
              }
            , Cmd.none
            )

        LineSelectorClicked ->
            ( { m
                | selector = LineSelector
                , tool = Select Idle
              }
            , Cmd.none
            )

        MouseMove mousePos ->
            case m.tool of
                Draw (Just { sourceId }) ->
                    ( { m | tool = Draw (Just (EdgeBrush sourceId mousePos)) }
                    , Cmd.none
                    )

                Select (BrushingForSelection { start }) ->
                    let
                        ( newSelectedVertices, newSelectedEdges ) =
                            case m.selector of
                                RectSelector ->
                                    let
                                        minx =
                                            toFloat (min start.x mousePos.x)

                                        miny =
                                            toFloat (min start.y mousePos.y)

                                        maxx =
                                            toFloat (max start.x mousePos.x)

                                        maxy =
                                            toFloat (max start.y mousePos.y)

                                        newSelectedVertices_ =
                                            m.graph
                                                |> Graph.getVertexIdsInRect
                                                    { x = minx
                                                    , y = miny
                                                    , width = maxx - minx
                                                    , height = maxy - miny
                                                    }
                                    in
                                    ( newSelectedVertices_
                                    , Graph.inducedEdges newSelectedVertices_ m.graph
                                    )

                                LineSelector ->
                                    let
                                        newSelectedEdges_ =
                                            m.graph
                                                |> Graph.getEdgeIdsIntersectingLineSegment
                                                    ( ( toFloat start.x
                                                      , toFloat start.y
                                                      )
                                                    , ( toFloat mousePos.x
                                                      , toFloat mousePos.y
                                                      )
                                                    )
                                    in
                                    ( Graph.inducedVertices newSelectedEdges_ m.graph
                                    , newSelectedEdges_
                                    )
                    in
                    ( { m
                        | tool =
                            Select
                                (BrushingForSelection
                                    (Brush start mousePos)
                                )
                        , selectedVertices = newSelectedVertices
                        , selectedEdges = newSelectedEdges
                      }
                    , Cmd.none
                    )

                Select (DraggingSelection startPositionsOfVertices { start }) ->
                    let
                        move { id, x, y } =
                            { id = id
                            , x = x + toFloat (mousePos.x - start.x)
                            , y = y + toFloat (mousePos.y - start.y)
                            }

                        newPositions =
                            List.map move startPositionsOfVertices
                    in
                    ( { m
                        | tool =
                            Select
                                (DraggingSelection startPositionsOfVertices
                                    (Brush start mousePos)
                                )
                        , graph =
                            Graph.moveVertices newPositions m.graph
                      }
                    , if m.vaderIsOn then
                        toD3Drag newPositions

                      else
                        Cmd.none
                    )

                Select (DraggingPullCenter bagId startPositionOfThePullCenter { start }) ->
                    let
                        newGraph =
                            let
                                { x, y } =
                                    startPositionOfThePullCenter

                                move bag =
                                    { bag
                                        | pullX =
                                            x + toFloat (mousePos.x - start.x)
                                        , pullY =
                                            y + toFloat (mousePos.y - start.y)
                                    }
                            in
                            m.graph |> Graph.updateBag bagId move
                    in
                    ( { m
                        | tool =
                            Select
                                (DraggingPullCenter bagId
                                    startPositionOfThePullCenter
                                    (Brush start mousePos)
                                )
                        , graph =
                            newGraph
                      }
                    , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
                    )

                _ ->
                    ( m
                    , Cmd.none
                    )

        MouseUp _ ->
            case m.tool of
                Select (BrushingForSelection { start, mousePos }) ->
                    ( { m
                        | tool = Select Idle
                        , selectedVertices =
                            if start == mousePos then
                                Set.empty

                            else
                                m.selectedVertices
                        , selectedEdges =
                            if start == mousePos then
                                Set.empty

                            else
                                m.selectedEdges
                      }
                    , Cmd.none
                    )

                Select (DraggingSelection _ _) ->
                    ( { m | tool = Select Idle }
                    , Cmd.batch
                        [ if m.vaderIsOn then
                            toD3DragEnd ()

                          else
                            Cmd.none
                        , sendGraphData m.graph
                        ]
                    )

                Select (DraggingPullCenter _ _ _) ->
                    ( { m | tool = Select Idle }
                    , Cmd.none
                    )

                _ ->
                    ( m
                    , Cmd.none
                    )

        MouseDownOnTransparentInteractionRect ({ x, y } as mousePos) ->
            case m.tool of
                Draw Nothing ->
                    let
                        ( upGraph, newId ) =
                            m.graph
                                |> Graph.addVertexAndGetTheNewVertexId
                                    mousePos
                                    ( m.vertexPreferences, m.maybeSelectedBag )

                        newGraph =
                            upGraph |> Graph.movePullCenterToCenter m.maybeSelectedBag
                    in
                    ( { m
                        | graph = newGraph
                        , tool = Draw (Just (EdgeBrush newId mousePos))
                      }
                    , Cmd.none
                    )

                Select Idle ->
                    ( { m | tool = Select (BrushingForSelection (Brush mousePos mousePos)) }
                    , Cmd.none
                    )

                _ ->
                    ( m, Cmd.none )

        MouseUpOnTransparentInteractionRect pos ->
            case m.tool of
                Draw (Just { sourceId }) ->
                    let
                        newGraph =
                            m.graph
                                |> Graph.addNeighbour pos
                                    sourceId
                                    ( m.vertexPreferences, m.maybeSelectedBag )
                                    m.edgePreferences
                    in
                    ( { m
                        | graph = newGraph
                        , tool = Draw Nothing
                      }
                    , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
                    )

                _ ->
                    ( m, Cmd.none )

        MouseOverVertex id ->
            ( { m | highlightingVertexOnMouseOver = Just id }
            , Cmd.none
            )

        MouseOverEdge edgeId ->
            ( { m | highlightingEdgeOnMouseOver = Just edgeId }
            , Cmd.none
            )

        MouseOutVertex _ ->
            ( { m | highlightingVertexOnMouseOver = Nothing }
            , Cmd.none
            )

        MouseOutEdge _ ->
            ( { m | highlightingEdgeOnMouseOver = Nothing }
            , Cmd.none
            )

        MouseDownOnVertex id mousePos ->
            case m.tool of
                Draw Nothing ->
                    ( { m
                        | tool =
                            case Graph.getRoundedVertexPosition id m.graph of
                                Just pos ->
                                    Draw (Just (EdgeBrush id pos))

                                _ ->
                                    Draw Nothing
                      }
                    , Cmd.none
                    )

                Select Idle ->
                    let
                        newSelectedVertices =
                            if Set.member id m.selectedVertices then
                                m.selectedVertices

                            else
                                Set.singleton id

                        idAndPosition vertexId { x, y } =
                            { id = vertexId, x = x, y = y }

                        startPositionsOfVertices =
                            m.graph
                                |> Graph.getVerticesIn newSelectedVertices
                                |> Dict.map idAndPosition
                                |> Dict.values
                    in
                    ( { m
                        | tool = Select (DraggingSelection startPositionsOfVertices (Brush mousePos mousePos))
                        , selectedVertices = newSelectedVertices
                      }
                    , if m.vaderIsOn then
                        toD3DragStart startPositionsOfVertices

                      else
                        Cmd.none
                    )

                _ ->
                    ( m, Cmd.none )

        MouseDownOnEdge ( s, t ) mousePos ->
            case m.tool of
                Draw Nothing ->
                    let
                        ( newGraph, idOfTheNewVertex ) =
                            m.graph
                                |> Graph.devideEdge mousePos
                                    ( s, t )
                                    ( m.vertexPreferences, m.maybeSelectedBag )
                    in
                    ( { m
                        | graph = newGraph
                        , highlightingEdgeOnMouseOver = Nothing
                        , tool = Draw (Just (EdgeBrush idOfTheNewVertex mousePos))
                      }
                    , Cmd.none
                    )

                Select Idle ->
                    let
                        ( newSelectedVertices, newSelectedEdges ) =
                            if Set.member ( s, t ) m.selectedEdges then
                                ( m.selectedVertices, m.selectedEdges )

                            else
                                ( Set.fromList [ s, t ]
                                , Set.singleton ( s, t )
                                )

                        idAndPosition vertexId { x, y } =
                            { id = vertexId, x = x, y = y }

                        startPositionsOfVertices =
                            m.graph
                                |> Graph.getVerticesIn newSelectedVertices
                                |> Dict.map idAndPosition
                                |> Dict.values
                    in
                    ( { m
                        | tool =
                            Select
                                (DraggingSelection startPositionsOfVertices
                                    (Brush mousePos mousePos)
                                )
                        , selectedVertices = newSelectedVertices
                        , selectedEdges = newSelectedEdges
                      }
                    , if m.vaderIsOn then
                        toD3DragStart startPositionsOfVertices

                      else
                        Cmd.none
                    )

                _ ->
                    ( m, Cmd.none )

        MouseUpOnVertex id ->
            case m.tool of
                Draw (Just { sourceId }) ->
                    let
                        newGraph =
                            if sourceId == id then
                                m.graph

                            else
                                m.graph
                                    |> Graph.addEdgeBetweenExistingVertices
                                        ( sourceId, id )
                                        m.edgePreferences
                    in
                    ( { m
                        | graph = newGraph
                        , tool = Draw Nothing
                      }
                    , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
                    )

                _ ->
                    ( m, Cmd.none )

        MouseUpOnEdge edgeId pos ->
            case m.tool of
                Draw (Just { sourceId }) ->
                    let
                        newGraph =
                            m.graph
                                |> Graph.addNeighbourDevidingEdge
                                    sourceId
                                    pos
                                    edgeId
                                    ( m.vertexPreferences, m.maybeSelectedBag )
                                    m.edgePreferences
                    in
                    ( { m
                        | graph = newGraph
                        , highlightingEdgeOnMouseOver = Nothing
                        , tool =
                            Draw Nothing
                      }
                    , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
                    )

                _ ->
                    ( m, Cmd.none )

        FromD3Tick { alpha, nodes } ->
            ( { m
                | graph = Graph.moveVertices nodes m.graph
                , alpha = alpha
              }
            , Cmd.none
            )

        VaderClicked ->
            let
                newVaderIsOn =
                    not m.vaderIsOn
            in
            ( { m | vaderIsOn = newVaderIsOn }
            , if newVaderIsOn then
                toD3RestartWithAlpha 1

              else
                toD3StopSimulation ()
            )

        FromConvexHullCheckBox b ->
            let
                updateCH bag =
                    { bag | hasConvexHull = b }

                ( newGraph, newBagPreferences ) =
                    case m.maybeSelectedBag of
                        Just bagId ->
                            ( m.graph |> Graph.updateBag bagId updateCH
                            , m.bagPreferences
                            )

                        Nothing ->
                            ( m.graph
                            , m.bagPreferences |> updateCH
                            )
            in
            ( { m
                | graph = newGraph
                , bagPreferences = newBagPreferences
              }
            , Cmd.none
            )

        FromPullIsActiveCheckBox b ->
            let
                updatePullIsActive bag =
                    { bag | pullIsActive = b }

                ( newGraph, newBagPreferences ) =
                    case m.maybeSelectedBag of
                        Just bagId ->
                            ( m.graph |> Graph.updateBag bagId updatePullIsActive
                            , m.bagPreferences
                            )

                        Nothing ->
                            ( m.graph
                            , m.bagPreferences |> updatePullIsActive
                            )
            in
            ( { m
                | graph = newGraph
                , bagPreferences = newBagPreferences
              }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromDraggableCenterCheckBox b ->
            let
                updateDraggablePullCenter bag =
                    { bag | draggablePullCenter = b }

                ( newGraph, newBagPreferences ) =
                    case m.maybeSelectedBag of
                        Just bagId ->
                            ( m.graph |> Graph.updateBag bagId updateDraggablePullCenter
                            , m.bagPreferences
                            )

                        Nothing ->
                            ( m.graph
                            , m.bagPreferences |> updateDraggablePullCenter
                            )
            in
            ( { m
                | graph = newGraph
                , bagPreferences = newBagPreferences
              }
            , Cmd.none
            )

        FromPullXStrengthInput str ->
            case m.maybeSelectedBag of
                Just bagId ->
                    let
                        oldPullXStrength =
                            m.graph
                                |> Graph.getBags
                                |> Dict.get bagId
                                |> Maybe.map .pullXStrength
                                |> Maybe.withDefault 0
                                |> clamp 0 1

                        newPullXStrength =
                            str
                                |> String.toFloat
                                |> Maybe.withDefault oldPullXStrength

                        newGraph =
                            m.graph
                                |> Graph.updateBag bagId
                                    (\bag -> { bag | pullXStrength = newPullXStrength })
                    in
                    ( { m | graph = newGraph }
                    , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
                    )

                Nothing ->
                    let
                        newPullXStrength =
                            str
                                |> String.toFloat
                                |> Maybe.withDefault m.bagPreferences.pullXStrength

                        oldCashedBag =
                            m.bagPreferences
                    in
                    ( { m
                        | bagPreferences =
                            { oldCashedBag
                                | pullXStrength = newPullXStrength
                            }
                      }
                    , Cmd.batch [ sendGraphData m.graph, reheatSimulationIfVaderIsOn ]
                    )

        FromPullYStrengthInput str ->
            case m.maybeSelectedBag of
                Just bagId ->
                    let
                        oldPullYStrength =
                            m.graph
                                |> Graph.getBags
                                |> Dict.get bagId
                                |> Maybe.map .pullYStrength
                                |> Maybe.withDefault 0

                        newPullYStrength =
                            str
                                |> String.toFloat
                                |> Maybe.withDefault oldPullYStrength
                                |> clamp 0 1

                        newGraph =
                            m.graph
                                |> Graph.updateBag bagId
                                    (\bag -> { bag | pullYStrength = newPullYStrength })
                    in
                    ( { m | graph = newGraph }
                    , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
                    )

                Nothing ->
                    let
                        newPullYStrength =
                            str
                                |> String.toFloat
                                |> Maybe.withDefault m.bagPreferences.pullYStrength

                        oldCashedBag =
                            m.bagPreferences
                    in
                    ( { m
                        | bagPreferences =
                            { oldCashedBag
                                | pullYStrength = newPullYStrength
                            }
                      }
                    , Cmd.batch [ sendGraphData m.graph, reheatSimulationIfVaderIsOn ]
                    )

        FromPullXInput str ->
            let
                updatePullX bag =
                    { bag
                        | pullX =
                            str |> String.toFloat |> Maybe.withDefault 0
                    }

                ( newGraph, newBagPreferences ) =
                    case m.maybeSelectedBag of
                        Just bagId ->
                            ( m.graph |> Graph.updateBag bagId updatePullX
                            , m.bagPreferences
                            )

                        Nothing ->
                            ( m.graph
                            , m.bagPreferences |> updatePullX
                            )
            in
            ( { m
                | graph = newGraph
                , bagPreferences = newBagPreferences
              }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromPullYInput str ->
            let
                updatePullY bag =
                    { bag
                        | pullY =
                            str |> String.toFloat |> Maybe.withDefault 0
                    }

                ( newGraph, newBagPreferences ) =
                    case m.maybeSelectedBag of
                        Just bagId ->
                            ( m.graph |> Graph.updateBag bagId updatePullY
                            , m.bagPreferences
                            )

                        Nothing ->
                            ( m.graph
                            , m.bagPreferences |> updatePullY
                            )
            in
            ( { m
                | graph = newGraph
                , bagPreferences = newBagPreferences
              }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromVertexColorPicker newColor ->
            let
                updateColor v =
                    { v | color = newColor }

                newGraph =
                    m.graph
                        |> Graph.updateVertices
                            m.selectedVertices
                            updateColor

                newVertexPreferences =
                    if Set.isEmpty m.selectedVertices then
                        updateColor m.vertexPreferences

                    else
                        m.vertexPreferences
            in
            ( { m
                | graph = newGraph
                , vertexPreferences = newVertexPreferences
              }
            , Cmd.none
            )

        FromEdgeColorPicker newColor ->
            let
                updateColor e =
                    { e | color = newColor }

                newGraph =
                    m.graph
                        |> Graph.updateEdges
                            m.selectedEdges
                            updateColor

                newEdgePreferences =
                    if Set.isEmpty m.selectedEdges then
                        updateColor m.edgePreferences

                    else
                        m.edgePreferences
            in
            ( { m
                | graph = newGraph
                , edgePreferences = newEdgePreferences
              }
            , Cmd.none
            )

        FromFixedCheckBox b ->
            let
                updateFixed v =
                    { v | fixed = b }

                newGraph =
                    m.graph
                        |> Graph.updateVertices
                            m.selectedVertices
                            updateFixed

                newVertexPreferences =
                    if Set.isEmpty m.selectedVertices then
                        updateFixed m.vertexPreferences

                    else
                        m.vertexPreferences
            in
            ( { m
                | graph = newGraph
                , vertexPreferences = newVertexPreferences
              }
            , Cmd.batch [ sendGraphData newGraph ]
            )

        FromRadiusInput str ->
            let
                updateRadius v =
                    { v | radius = newRadius }

                newRadius =
                    str |> String.toFloat |> Maybe.withDefault 0 |> clamp 4 20

                newGraph =
                    m.graph
                        |> Graph.updateVertices
                            m.selectedVertices
                            updateRadius

                newVertexPreferences =
                    if Set.isEmpty m.selectedVertices then
                        updateRadius m.vertexPreferences

                    else
                        m.vertexPreferences
            in
            ( { m
                | graph = newGraph
                , vertexPreferences = newVertexPreferences
              }
            , Cmd.none
            )

        FromThicknessInput str ->
            let
                updateThickness e =
                    { e | thickness = newThickness }

                newThickness =
                    str |> String.toFloat |> Maybe.withDefault 0 |> clamp 1 20

                newGraph =
                    m.graph
                        |> Graph.updateEdges
                            m.selectedEdges
                            updateThickness

                newEdgePreferences =
                    if Set.isEmpty m.selectedEdges then
                        updateThickness m.edgePreferences

                    else
                        m.edgePreferences
            in
            ( { m
                | graph = newGraph
                , edgePreferences = newEdgePreferences
              }
            , Cmd.none
            )

        FromDistanceInput str ->
            let
                updateDistance e =
                    { e | distance = newDistance }

                newDistance =
                    str |> String.toFloat |> Maybe.withDefault 0 |> clamp 0 2000

                newGraph =
                    m.graph
                        |> Graph.updateEdges
                            m.selectedEdges
                            updateDistance

                newEdgePreferences =
                    if Set.isEmpty m.selectedEdges then
                        updateDistance m.edgePreferences

                    else
                        m.edgePreferences
            in
            ( { m
                | graph = newGraph
                , edgePreferences = newEdgePreferences
              }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromStrengthInput str ->
            let
                updateStrength e =
                    { e | strength = newStrength }

                newStrength =
                    str |> String.toFloat |> Maybe.withDefault 0 |> clamp 0 1

                newGraph =
                    m.graph
                        |> Graph.updateEdges
                            m.selectedEdges
                            updateStrength

                newEdgePreferences =
                    if Set.isEmpty m.selectedEdges then
                        updateStrength m.edgePreferences

                    else
                        m.edgePreferences
            in
            ( { m
                | graph = newGraph
                , edgePreferences = newEdgePreferences
              }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromManyBodyStrengthInput str ->
            let
                currentStrength =
                    m.graph |> Graph.getManyBody |> .strength

                newStrength =
                    str |> String.toFloat |> Maybe.withDefault currentStrength

                up mB =
                    { mB | strength = newStrength }

                newGraph =
                    m.graph |> Graph.updateManyBody up
            in
            ( { m | graph = newGraph }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromManyBodyThetaInput str ->
            let
                currentTheta =
                    m.graph |> Graph.getManyBody |> .theta

                newTheta =
                    str |> String.toFloat |> Maybe.withDefault currentTheta

                up mB =
                    { mB | theta = newTheta }

                newGraph =
                    m.graph |> Graph.updateManyBody up
            in
            ( { m | graph = newGraph }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromManyBodyMinDistanceInput str ->
            let
                currentDistanceMin =
                    m.graph |> Graph.getManyBody |> .distanceMin

                newDistanceMin =
                    str |> String.toFloat |> Maybe.withDefault currentDistanceMin

                up mB =
                    { mB | distanceMin = newDistanceMin }

                newGraph =
                    m.graph |> Graph.updateManyBody up
            in
            ( { m | graph = newGraph }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromManyBodyMaxDistanceInput str ->
            let
                currentDistanceMax =
                    m.graph |> Graph.getManyBody |> .distanceMax

                newDistanceMax =
                    str |> String.toFloat |> Maybe.withDefault currentDistanceMax

                up mB =
                    { mB | distanceMax = newDistanceMax }

                newGraph =
                    m.graph |> Graph.updateManyBody up
            in
            ( { m | graph = newGraph }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        FromYInput str ->
            case m.tool of
                Select _ ->
                    ( { m
                        | graph =
                            let
                                oldCenterY =
                                    case Graph.getCenter m.selectedVertices m.graph of
                                        Just { y } ->
                                            y

                                        Nothing ->
                                            0

                                newY =
                                    str
                                        |> String.toFloat
                                        |> Maybe.withDefault oldCenterY
                            in
                            m.graph
                                |> Graph.moveCenterY m.selectedVertices
                                    newY
                      }
                    , Cmd.none
                    )

                _ ->
                    ( m, Cmd.none )

        FromXInput str ->
            case m.tool of
                Select _ ->
                    ( { m
                        | graph =
                            let
                                oldCenterX =
                                    case Graph.getCenter m.selectedVertices m.graph of
                                        Just { x } ->
                                            x

                                        Nothing ->
                                            0

                                newX =
                                    str
                                        |> String.toFloat
                                        |> Maybe.withDefault oldCenterX
                            in
                            m.graph
                                |> Graph.moveCenterX m.selectedVertices
                                    newX
                      }
                    , Cmd.none
                    )

                _ ->
                    ( m, Cmd.none )

        ClickOnVertexTrash ->
            let
                newGraph =
                    m.graph |> Graph.removeVertices m.selectedVertices
            in
            ( { m
                | graph = newGraph
                , selectedVertices = Set.empty
                , highlightingVertexOnMouseOver = Nothing
                , selectedEdges = Set.empty
                , highlightingEdgeOnMouseOver = Nothing
              }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        ClickOnEdgeTrash ->
            let
                newGraph =
                    m.graph |> Graph.removeEdges m.selectedEdges
            in
            ( { m
                | graph = newGraph
                , highlightingEdgeOnMouseOver = Nothing
                , selectedEdges = Set.empty
              }
            , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
            )

        ClickOnEdgeContract ->
            case Set.toList m.selectedEdges of
                [ selectedEdge ] ->
                    let
                        newGraph =
                            m.graph
                                |> Graph.contractEdge
                                    selectedEdge
                                    m.vertexPreferences
                    in
                    ( { m
                        | graph = newGraph
                        , highlightingEdgeOnMouseOver = Nothing
                        , selectedEdges = Set.empty
                      }
                    , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
                    )

                _ ->
                    ( m, Cmd.none )

        ClickOnBagTrash ->
            case m.maybeSelectedBag of
                Just bagId ->
                    let
                        newGraph =
                            m.graph |> Graph.removeBag bagId
                    in
                    ( { m
                        | graph = newGraph
                        , maybeSelectedBag = Nothing
                      }
                    , Cmd.batch [ sendGraphData newGraph, reheatSimulationIfVaderIsOn ]
                    )

                Nothing ->
                    ( m, Cmd.none )

        ClickOnBagPlus ->
            let
                ( newGraph_, idOfTheNewBag ) =
                    Graph.addBagAndGetNewBagId m.selectedVertices m.bagPreferences m.graph

                newGraph =
                    Graph.movePullCenterToCenter (Just idOfTheNewBag) newGraph_
            in
            ( { m
                | graph = newGraph
                , maybeSelectedBag = Just idOfTheNewBag
              }
            , Cmd.none
            )

        MouseOverVertexItem vertexId ->
            ( { m | highlightingVertexOnMouseOver = Just vertexId }
            , Cmd.none
            )

        MouseOutVertexItem _ ->
            ( { m | highlightingVertexOnMouseOver = Nothing }
            , Cmd.none
            )

        MouseOutEdgeItem _ ->
            ( { m | highlightingEdgeOnMouseOver = Nothing }
            , Cmd.none
            )

        ClickOnVertexItem vertexId ->
            ( { m
                | tool = Select Idle
                , selectedVertices = Set.singleton vertexId
                , selectedEdges = Set.empty
              }
            , Cmd.none
            )

        ClickOnEdgeItem ( sourceId, targetId ) ->
            ( { m
                | tool = Select Idle
                , selectedVertices = Set.fromList [ sourceId, targetId ]
                , selectedEdges = Set.singleton ( sourceId, targetId )
              }
            , Cmd.none
            )

        MouseOverBagItem bagId ->
            ( { m | highlightingBagOnMouseOver = Just bagId }, Cmd.none )

        MouseOverEdgeItem edgeId ->
            ( { m | highlightingEdgeOnMouseOver = Just edgeId }, Cmd.none )

        MouseOverPullCenter bagId ->
            ( { m | highlightingPullCenterOnMouseOver = Just bagId }, Cmd.none )

        MouseOutBagItem _ ->
            ( { m | highlightingBagOnMouseOver = Nothing }, Cmd.none )

        MouseOutPullCenter _ ->
            ( { m | highlightingPullCenterOnMouseOver = Nothing }, Cmd.none )

        ClickOnBagItem bagId ->
            ( { m
                | maybeSelectedBag =
                    if m.maybeSelectedBag == Just bagId then
                        Nothing

                    else
                        Just bagId
                , selectedVertices =
                    if m.maybeSelectedBag == Just bagId then
                        Set.empty

                    else
                        m.graph |> Graph.getVerticesInBag bagId
                , tool = Select Idle
              }
            , Cmd.none
            )

        ClickOnPullCenter bagId ->
            ( { m
                | maybeSelectedBag = Just bagId
                , selectedVertices = m.graph |> Graph.getVerticesInBag bagId
              }
            , Cmd.none
            )

        MouseDownOnPullCenter bagId mousePos ->
            case Graph.getBag bagId m.graph of
                Just bag ->
                    ( { m
                        | tool =
                            Select
                                (DraggingPullCenter bagId
                                    { x = bag.pullX, y = bag.pullY }
                                    (Brush mousePos mousePos)
                                )
                      }
                    , Cmd.none
                    )

                Nothing ->
                    ( m, Cmd.none )

        ThinBarButtonClicked leftBarContent ->
            ( { m | leftBarContent = leftBarContent }
            , Cmd.none
            )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Browser.Events.onResize (\w h -> UpdateWindowSize { width = w, height = h })
        , Browser.Events.onMouseMove (Decode.map MouseMove mousePosition)
        , Browser.Events.onMouseUp (Decode.map MouseUp mousePosition)
        , fromD3TickData FromD3Tick
        , Browser.Events.onKeyDown (Decode.map keyBoardShortcut keyDecoder)
        ]


keyBoardShortcut : Key -> Msg
keyBoardShortcut key =
    case key of
        Character 's' ->
            SelectToolClicked

        Character 'd' ->
            DrawToolClicked

        Character 'f' ->
            VaderClicked

        Control "Backspace" ->
            ClickOnVertexTrash

        _ ->
            NoOp


type Key
    = Character Char
    | Control String


keyDecoder : Decode.Decoder Key
keyDecoder =
    Decode.map toKey (Decode.field "key" Decode.string)


toKey : String -> Key
toKey string =
    case String.uncons string of
        Just ( c, "" ) ->
            Character c

        _ ->
            Control string



-- VIEW


topBarHeight =
    57


leftBarWidth =
    300


rightBarWidth =
    300


leftBarHeaderSize =
    38


leftBarHeaderTextSize =
    10


view : Model -> Html Msg
view m =
    div
        [ HA.style "width" "100vw" ]
        [ mainSvg m
        , viewAlpha m
        , leftBar m
        , rightBar m
        , topBar m
        , forDebugging m
        ]


forDebugging : Model -> Html Msg
forDebugging m =
    div [ HA.id "forDebugging" ]
        [ H.text ""

        -- (Debug.toString (m.graph |> Graph.getManyBody))
        ]



--top Bar


topBar : Model -> Html Msg
topBar m =
    div
        [ HA.id "topBar"
        , HA.style "left" (String.fromFloat (leftBarWidth + 2) ++ "px")
        , HA.style "width" (String.fromFloat (toFloat m.windowSize.width - leftBarWidth - rightBarWidth - 3) ++ "px")
        , HA.style "height" (String.fromFloat topBarHeight ++ "px")
        ]
        [ --undoRedoButtonGroup
          toolSelectionButtonGroup m
        , shortCutsButtonGroup m

        --, importExportButtons
        ]


toolSelectionButtonGroup : Model -> Html Msg
toolSelectionButtonGroup m =
    div
        [ HA.class "radio-button-group" ]
        [ div
            [ HA.title "Selection (S)"
            , HE.onClick SelectToolClicked
            , HA.class <|
                case m.tool of
                    Select _ ->
                        "radio-button-selected"

                    _ ->
                        "radio-button"
            ]
            [ Icons.draw34px Icons.icons.pointer ]
        , div
            [ HA.title "Draw (D)"
            , HE.onClick DrawToolClicked
            , HA.class <|
                case m.tool of
                    Draw _ ->
                        "radio-button-selected"

                    _ ->
                        "radio-button"
            ]
            [ Icons.draw34px Icons.icons.pen ]
        ]


shortCutsButtonGroup : Model -> Html Msg
shortCutsButtonGroup m =
    div
        [ HA.class "radio-button-group" ]
        [ div
            [ HA.title "Force (F)"
            , HA.class <|
                if m.vaderIsOn then
                    "radio-button-selected"

                else
                    "radio-button"
            , HE.onClick VaderClicked
            ]
            [ Icons.draw34px Icons.icons.vader ]
        ]



-- ALPHA


viewAlpha : Model -> Html Msg
viewAlpha m =
    div
        [ HA.id "alpha"
        , HA.style "position" "absolute"
        , HA.style "left" (String.fromFloat leftBarWidth ++ "px")
        , HA.style "right" (String.fromFloat rightBarWidth ++ "px")
        , HA.style "bottom" "0px"
        , HA.style "height" "8px"
        ]
        [ div
            [ HA.style "width" (String.fromFloat (100 * m.alpha) ++ "%")
            , HA.style "height" "100%"
            , HA.style "background-color" "#454545"
            ]
            []
        ]



-- LEFT BAR


leftBarHeader =
    div
        [ HA.id "header-in-left-bar"
        , HA.style "height" (String.fromInt leftBarHeaderSize ++ "px")
        ]


leftBarHeaderText headerText =
    div
        [ HA.style "float" "left"
        , HA.style "padding" (String.fromInt leftBarHeaderTextSize ++ "px")
        ]
        [ H.text headerText ]


leftBarContentForPreferences : Model -> List (Html Msg)
leftBarContentForPreferences m =
    [ leftBarHeader
        [ leftBarHeaderText "Preferences (coming soon)" ]
    ]


leftBarContentForListsOfBagsVerticesAndEdges : Model -> List (Html Msg)
leftBarContentForListsOfBagsVerticesAndEdges m =
    let
        -- bags
        viewBagList =
            div []
                [ bagsHeader
                , listOfBags
                ]

        bagsHeader =
            leftBarHeader
                [ leftBarHeaderText "Bags"
                , div
                    [ HA.class "button"
                    , HA.title "Remove Selected Bag"
                    , HE.onClick ClickOnBagTrash
                    ]
                    [ Icons.draw24px Icons.icons.trash
                    ]
                , div
                    [ HA.class "button"
                    , HA.title "Add New Bag"
                    , HE.onClick ClickOnBagPlus
                    ]
                    [ Icons.draw24px Icons.icons.plus ]
                ]

        listOfBags =
            div []
                (Graph.getBags m.graph
                    |> Dict.map bagItem
                    |> Dict.values
                    |> List.reverse
                )

        bagItem bagId _ =
            div
                [ HA.style "padding" "4px 20px 4px 20px"
                , HA.class <|
                    if Just bagId == m.maybeSelectedBag then
                        "leftBarContent-item-selected"

                    else
                        "leftBarContent-item"
                , if m.highlightingBagOnMouseOver == Just bagId then
                    HA.style "border-right" "6px solid rgb(197, 18, 98)"

                  else
                    HA.style "" ""
                , HE.onMouseOver (MouseOverBagItem bagId)
                , HE.onMouseOut (MouseOutBagItem bagId)
                , HE.onClick (ClickOnBagItem bagId)
                ]
                [ H.text (m.graph |> Graph.bagElementsInCurlyBraces bagId) ]

        -- vertices
        viewVertexList =
            div []
                [ verticesHeader
                , listOfVertices
                ]

        verticesHeader =
            leftBarHeader
                [ leftBarHeaderText "Vertices"
                , div
                    [ HA.class "button"
                    , HA.title "Remove Selected Vertices"
                    , HE.onClick ClickOnVertexTrash
                    ]
                    [ Icons.draw24px Icons.icons.trash ]
                ]

        listOfVertices =
            div []
                (Graph.getVertices m.graph
                    |> Dict.map vertexItem
                    |> Dict.values
                    |> List.reverse
                )

        vertexItem vertexId _ =
            div
                [ HA.style "padding" "4px 20px 4px 20px"
                , HA.class <|
                    if Set.member vertexId m.selectedVertices then
                        "leftBarContent-item-selected"

                    else
                        "leftBarContent-item"
                , if m.highlightingVertexOnMouseOver == Just vertexId then
                    HA.style "border-right" "6px solid rgb(197, 18, 98)"

                  else
                    HA.style "" ""
                , HE.onMouseOver (MouseOverVertexItem vertexId)
                , HE.onMouseOut (MouseOutVertexItem vertexId)
                , HE.onClick (ClickOnVertexItem vertexId)
                ]
                [ H.text (String.fromInt vertexId) ]

        -- edges
        viewEdgeList =
            div []
                [ edgesHeader
                , listOfEdges
                ]

        maybeEdgeContractButton =
            if Set.size m.selectedEdges == 1 then
                div
                    [ HA.class "button"
                    , HE.onClick ClickOnEdgeContract
                    , HA.title "Contract the selected edge"
                    ]
                    [ Icons.draw24px Icons.icons.edgeContract
                    ]

            else
                div [] []

        edgesHeader =
            leftBarHeader
                [ leftBarHeaderText "Edges"
                , div
                    [ HA.class "button"
                    , HA.title "Remove Selected Edges"
                    , HE.onClick ClickOnEdgeTrash
                    ]
                    [ Icons.draw24px Icons.icons.trash
                    ]
                , maybeEdgeContractButton
                ]

        listOfEdges =
            div []
                (Graph.getEdges m.graph
                    |> Dict.map edgeItem
                    |> Dict.values
                    |> List.reverse
                )

        edgeIdToString ( sourceId, targetId ) =
            String.fromInt sourceId ++ " → " ++ String.fromInt targetId

        edgeItem edgeId _ =
            div
                [ HA.style "padding" "4px 20px 4px 20px"
                , HA.class <|
                    if Set.member edgeId m.selectedEdges then
                        "leftBarContent-item-selected"

                    else
                        "leftBarContent-item"
                , if m.highlightingEdgeOnMouseOver == Just edgeId then
                    HA.style "border-right" "6px solid rgb(197, 18, 98)"

                  else
                    HA.style "" ""
                , HE.onMouseOver (MouseOverEdgeItem edgeId)
                , HE.onMouseOut (MouseOutEdgeItem edgeId)
                , HE.onClick (ClickOnEdgeItem edgeId)
                ]
                [ H.text (edgeIdToString edgeId) ]
    in
    [ viewBagList
    , viewVertexList
    , viewEdgeList
    ]


leftBarContentForGraphOperations : Model -> List (Html Msg)
leftBarContentForGraphOperations m =
    [ leftBarHeader
        [ leftBarHeaderText "Graph Operations (coming soon)" ]
    ]


leftBarContentForGraphQueries : Model -> List (Html Msg)
leftBarContentForGraphQueries m =
    [ leftBarHeader
        [ leftBarHeaderText "Graph Queries (coming soon)" ]
    ]


leftBarContentForGraphGenerators : Model -> List (Html Msg)
leftBarContentForGraphGenerators m =
    [ leftBarHeader
        [ leftBarHeaderText "Graph Generators (coming soon)" ]
    ]


leftBarContentForAlgorithmVisualizations : Model -> List (Html Msg)
leftBarContentForAlgorithmVisualizations m =
    [ leftBarHeader
        [ leftBarHeaderText "Algorithm Visualizations (coming soon)" ]
    ]


leftBarContentForGamesOnGraphs : Model -> List (Html Msg)
leftBarContentForGamesOnGraphs m =
    [ leftBarHeader
        [ leftBarHeaderText "Games on Graphs (coming soon)" ]
    ]


leftBar : Model -> Html Msg
leftBar m =
    let
        thinBandWidth =
            40

        thinBandButton title leftBarContent icon =
            let
                color =
                    if leftBarContent == m.leftBarContent then
                        "white"

                    else
                        "rgb(46, 46, 46)"
            in
            div
                [ HA.title title
                , HA.class "thinBandButton"
                , HE.onClick (ThinBarButtonClicked leftBarContent)
                ]
                [ Icons.draw40pxWithColor color icon ]

        githubButton =
            H.a
                [ HA.title "Source Code"
                , HA.href "https://github.com/erkal/kite"
                , HA.target "_blank"
                ]
                [ Icons.draw40pxWithColor "yellow" Icons.icons.githubCat ]

        donateButton =
            div
                [ HA.title "Donate"

                -- , HE.onClick (DonateButtonClicked)
                ]
                [ Icons.draw40pxWithColor "orchid" Icons.icons.donateHeart ]

        thinBandRadioButtons =
            div [ HA.id "thinBarButtonGroup" ]
                [ thinBandButton "Preferences" Preferences Icons.icons.preferencesGear
                , thinBandButton "Lists of Bags, Vertices and Edges" ListsOfBagsVerticesAndEdges Icons.icons.listOfThree
                , thinBandButton "Graph Operations" GraphOperations Icons.icons.magicStick
                , thinBandButton "Graph Queries" GraphQueries Icons.icons.qForQuery
                , thinBandButton "Graph Generators" GraphGenerators Icons.icons.lightning
                , thinBandButton "Algorithm Visualizations" AlgorithmVisualizations Icons.icons.algoVizPlay
                , thinBandButton "Games on Graphs" GamesOnGraphs Icons.icons.chessHorse
                ]

        thinBand =
            div
                [ HA.id "leftBarThinBand"
                , HA.style "position" "absolute"
                , HA.style "width" (String.fromInt thinBandWidth ++ "px")
                , HA.style "height" "100%"
                , HA.style "overflow" "scroll"
                ]
                [ thinBandRadioButtons
                , githubButton
                ]

        content =
            div
                [ HA.id "leftBarContent"
                , HA.style "position" "absolute"
                , HA.style "left" (String.fromInt thinBandWidth ++ "px")
                , HA.style "width" (String.fromInt (leftBarWidth - thinBandWidth) ++ "px")
                , HA.style "height" "100%"
                , HA.style "overflow" "scroll"
                ]
                (case m.leftBarContent of
                    Preferences ->
                        leftBarContentForPreferences m

                    ListsOfBagsVerticesAndEdges ->
                        leftBarContentForListsOfBagsVerticesAndEdges m

                    GraphOperations ->
                        leftBarContentForGraphOperations m

                    GraphQueries ->
                        leftBarContentForGraphQueries m

                    GraphGenerators ->
                        leftBarContentForGraphGenerators m

                    AlgorithmVisualizations ->
                        leftBarContentForAlgorithmVisualizations m

                    GamesOnGraphs ->
                        leftBarContentForGamesOnGraphs m
                )
    in
    div []
        [ thinBand
        , content
        ]



-- RIGHT BAR


subMenu : String -> List (Html Msg) -> Html Msg
subMenu header rest =
    div [ HA.class "right-bar-submenu" ] <|
        div [ HA.style "margin-bottom" "20px" ]
            [ div [ HA.class "right-bar-submenu-header" ] [ H.text header ] ]
            :: rest


lineWithColumns : Int -> List (Html Msg) -> Html Msg
lineWithColumns columnSize columns =
    let
        item content =
            div
                [ HA.style "display" "inline-block"
                , HA.style "width" (String.fromInt columnSize ++ "px")
                ]
                [ content ]
    in
    div
        [ HA.style "margin-bottom" "10px"
        , HA.style "display" "block"
        ]
        (List.map item columns)


input : String -> Html Msg -> Html Msg
input label inputField =
    div []
        [ H.label
            [ HA.style "width" "80px"
            , HA.style "padding-right" "8px"
            , HA.style "vertical-align" "middle"
            , HA.style "display" "inline-block"
            , HA.style "text-align" "right"
            ]
            [ H.text label ]
        , div [ HA.style "display" "inline-block" ] [ inputField ]
        ]


numberInput : List (H.Attribute msg) -> Html msg
numberInput attributes =
    H.input
        ([ HA.style "width" "40px"
         , HA.style "padding-left" "4px"
         , HA.style "padding-top" "4px"
         , HA.style "padding-bottom" "4px"
         , HA.type_ "number"
         ]
            ++ attributes
        )
        []


selectionType : Model -> Html Msg
selectionType m =
    let
        rectSelector =
            div
                [ HA.style "float" "left"
                , HA.style "margin" "1px"
                , HA.title "Rectangle Selector"
                , HE.onClick RectSelectorClicked
                , HA.class <|
                    case m.selector of
                        RectSelector ->
                            "radio-button-selected"

                        _ ->
                            "radio-button"
                ]
                [ Icons.draw24px Icons.icons.selectionRect ]

        lineSelector =
            div
                [ HA.style "float" "left"
                , HA.style "margin" "1px"
                , HA.title "Line Selector"
                , HE.onClick LineSelectorClicked
                , HA.class <|
                    case m.selector of
                        LineSelector ->
                            "radio-button-selected"

                        _ ->
                            "radio-button"
                ]
                [ Icons.draw24px Icons.icons.selectionLine ]
    in
    subMenu "Selection"
        [ lineWithColumns 280
            [ input "Selector" <|
                div
                    [ HA.style "vertical-align" "middle"
                    , HA.style "display" "inline-block"
                    ]
                    [ div [ HA.class "radio-button-group" ]
                        [ rectSelector
                        , lineSelector
                        ]
                    , div [ HA.style "clear" "both" ] []
                    ]
            ]
        ]


headerForBagProperties : Model -> String
headerForBagProperties m =
    case m.maybeSelectedBag of
        Nothing ->
            "Bag Preferences"

        Just bagId ->
            "Selected Bag"


bagProperties : Model -> Html Msg
bagProperties m =
    subMenu (headerForBagProperties m)
        [ lineWithColumns 140
            [ input "Convex Hull" <|
                H.map FromConvexHullCheckBox <|
                    CheckBox.view <|
                        case m.maybeSelectedBag of
                            Just bagId ->
                                case Graph.getBag bagId m.graph of
                                    Just bag ->
                                        Just bag.hasConvexHull

                                    Nothing ->
                                        Nothing

                            Nothing ->
                                Just m.bagPreferences.hasConvexHull
            ]
        , lineWithColumns 140
            [ input "Pull Active" <|
                H.map FromPullIsActiveCheckBox <|
                    CheckBox.view <|
                        case m.maybeSelectedBag of
                            Just bagId ->
                                case Graph.getBag bagId m.graph of
                                    Just bag ->
                                        Just bag.pullIsActive

                                    Nothing ->
                                        Nothing

                            Nothing ->
                                Just m.bagPreferences.pullIsActive
            , input "Show Center" <|
                H.map FromDraggableCenterCheckBox <|
                    CheckBox.view <|
                        case m.maybeSelectedBag of
                            Just bagId ->
                                case Graph.getBag bagId m.graph of
                                    Just bag ->
                                        Just bag.draggablePullCenter

                                    Nothing ->
                                        Nothing

                            Nothing ->
                                Just m.bagPreferences.draggablePullCenter
            ]
        , lineWithColumns 140
            [ input "Pull X" <|
                numberInput
                    [ HE.onInput FromPullXInput
                    , HA.value <|
                        String.fromFloat <|
                            case m.maybeSelectedBag of
                                Just bagId ->
                                    m.graph
                                        |> Graph.getBags
                                        |> Dict.get bagId
                                        |> Maybe.map .pullX
                                        |> Maybe.withDefault 400

                                Nothing ->
                                    m.bagPreferences.pullX
                    ]
            , input "Pull Y" <|
                numberInput
                    [ HE.onInput FromPullYInput
                    , HA.value <|
                        String.fromFloat <|
                            case m.maybeSelectedBag of
                                Just bagId ->
                                    m.graph
                                        |> Graph.getBags
                                        |> Dict.get bagId
                                        |> Maybe.map .pullY
                                        |> Maybe.withDefault 400

                                Nothing ->
                                    m.bagPreferences.pullY
                    ]
            ]
        , lineWithColumns 140
            [ input "Pull X Strength" <|
                numberInput
                    [ HE.onInput FromPullXStrengthInput
                    , HA.value <|
                        String.fromFloat <|
                            case m.maybeSelectedBag of
                                Just bagId ->
                                    m.graph
                                        |> Graph.getBags
                                        |> Dict.get bagId
                                        |> Maybe.map .pullXStrength
                                        |> Maybe.withDefault 0.1

                                Nothing ->
                                    m.bagPreferences.pullXStrength
                    , HA.min "0"
                    , HA.max "1"
                    , HA.step "0.02"
                    ]
            , input "Pull Y Strength" <|
                numberInput
                    [ HE.onInput FromPullYStrengthInput
                    , HA.value <|
                        String.fromFloat <|
                            case m.maybeSelectedBag of
                                Just bagId ->
                                    m.graph
                                        |> Graph.getBags
                                        |> Dict.get bagId
                                        |> Maybe.map .pullYStrength
                                        |> Maybe.withDefault 0.1

                                Nothing ->
                                    m.bagPreferences.pullYStrength
                    , HA.min "0"
                    , HA.max "1"
                    , HA.step "0.02"
                    ]
            ]
        ]


vertexProperties : Model -> Html Msg
vertexProperties m =
    let
        headerForVertexProperties =
            case Set.size m.selectedVertices of
                0 ->
                    "Vertex Preferences"

                1 ->
                    "Selected Vertex"

                _ ->
                    "Selected Vertices"

        ( commonXToShow, commonYToShow ) =
            case Graph.getCenter m.selectedVertices m.graph of
                Nothing ->
                    ( "", "" )

                Just { x, y } ->
                    ( String.fromInt (round x), String.fromInt (round y) )

        radiusToShow =
            let
                maybeCommonRadius =
                    if Set.isEmpty m.selectedVertices then
                        Just m.vertexPreferences.radius

                    else
                        m.graph
                            |> Graph.getCommonVertexProperty m.selectedVertices .radius
            in
            case maybeCommonRadius of
                Just r ->
                    String.fromFloat r

                Nothing ->
                    ""

        maybeCommonVertexColor =
            if Set.isEmpty m.selectedVertices then
                Just m.vertexPreferences.color

            else
                m.graph |> Graph.getCommonVertexProperty m.selectedVertices .color

        maybeCommonFixed =
            if Set.isEmpty m.selectedVertices then
                Just m.vertexPreferences.fixed

            else
                m.graph |> Graph.getCommonVertexProperty m.selectedVertices .fixed
    in
    subMenu headerForVertexProperties
        [ lineWithColumns 140
            [ input "X" <|
                numberInput
                    [ HA.value commonXToShow
                    , HE.onInput FromXInput
                    ]
            , input "Y" <|
                numberInput
                    [ HA.value commonYToShow
                    , HE.onInput FromYInput
                    ]
            ]
        , lineWithColumns 140
            [ input "Color" <|
                H.map FromVertexColorPicker <|
                    ColorPicker.view maybeCommonVertexColor
            , input "Radius" <|
                numberInput
                    [ HA.min "4"
                    , HA.max "20"
                    , HA.step "1"
                    , HA.value radiusToShow
                    , HE.onInput FromRadiusInput
                    ]
            ]
        , lineWithColumns 140
            [ input "Fixed" <|
                H.map FromFixedCheckBox <|
                    CheckBox.view maybeCommonFixed
            ]
        ]


edgeProperties : Model -> Html Msg
edgeProperties m =
    let
        headerForEdgeProperties =
            case Set.size m.selectedEdges of
                0 ->
                    "Edge Preferences"

                1 ->
                    "Selected Edge"

                _ ->
                    "Selected Edges"

        thicknessToShow =
            let
                maybeCommonThickness =
                    if Set.isEmpty m.selectedEdges then
                        Just m.edgePreferences.thickness

                    else
                        m.graph
                            |> Graph.getCommonEdgeProperty m.selectedEdges .thickness
            in
            case maybeCommonThickness of
                Just r ->
                    String.fromFloat r

                Nothing ->
                    ""

        distanceToShow =
            let
                maybeCommonDistance =
                    if Set.isEmpty m.selectedEdges then
                        Just m.edgePreferences.distance

                    else
                        m.graph
                            |> Graph.getCommonEdgeProperty
                                m.selectedEdges
                                .distance
            in
            case maybeCommonDistance of
                Just r ->
                    String.fromFloat r

                Nothing ->
                    ""

        strengthToShow =
            let
                maybeCommonStrength =
                    if Set.isEmpty m.selectedEdges then
                        Just m.edgePreferences.strength

                    else
                        m.graph
                            |> Graph.getCommonEdgeProperty
                                m.selectedEdges
                                .strength
            in
            case maybeCommonStrength of
                Just r ->
                    String.fromFloat r

                Nothing ->
                    ""

        maybeCommonEdgeColor =
            if Set.isEmpty m.selectedEdges then
                Just m.edgePreferences.color

            else
                m.graph |> Graph.getCommonEdgeProperty m.selectedEdges .color
    in
    subMenu headerForEdgeProperties
        [ lineWithColumns 140
            [ input "Color" <|
                H.map FromEdgeColorPicker <|
                    ColorPicker.view maybeCommonEdgeColor
            , input "thickness" <|
                numberInput
                    [ HA.value thicknessToShow
                    , HE.onInput FromThicknessInput
                    , HA.min "1"
                    , HA.max "20"
                    , HA.step "1"
                    ]
            ]
        , lineWithColumns 140
            [ input "distance" <|
                numberInput
                    [ HA.value distanceToShow
                    , HE.onInput FromDistanceInput
                    , HA.min "0"
                    , HA.max "2000"
                    , HA.step "1"
                    ]
            , input "strength" <|
                numberInput
                    [ HA.value strengthToShow
                    , HE.onInput FromStrengthInput
                    , HA.min "0"
                    , HA.max "1"
                    , HA.step "0.05"
                    ]
            ]
        ]


manyBodyProperties : Model -> Html Msg
manyBodyProperties m =
    let
        mB =
            Graph.getManyBody m.graph
    in
    subMenu "Many Body"
        [ lineWithColumns 140
            [ input "Strength" <|
                numberInput
                    [ HA.min "-1000"
                    , HA.max "0"
                    , HA.step "10"
                    , HA.value (String.fromFloat mB.strength)
                    , HE.onInput FromManyBodyStrengthInput
                    ]
            , input "Theta" <|
                numberInput
                    [ HA.min "0"
                    , HA.max "1"
                    , HA.step "0.1"
                    , HA.value (String.fromFloat mB.theta)
                    , HE.onInput FromManyBodyThetaInput
                    ]
            ]
        , lineWithColumns 140
            [ input "Min Distance" <|
                numberInput
                    [ HA.min "0"
                    , HA.max "1000"
                    , HA.step "1"
                    , HA.value (String.fromFloat mB.distanceMin)
                    , HE.onInput FromManyBodyMinDistanceInput
                    ]
            , input "Max Distance" <|
                numberInput
                    [ HA.value (String.fromFloat mB.distanceMax)
                    , HE.onInput FromManyBodyMaxDistanceInput
                    ]
            ]
        ]


rightBar : Model -> Html Msg
rightBar m =
    div
        [ HA.id "rightBar"
        , HA.style "right" "0px"
        , HA.style "width" (String.fromInt rightBarWidth ++ "px")
        , HA.style "height" "100%"
        ]
        [ selectionType m
        , bagProperties m
        , vertexProperties m
        , edgeProperties m
        , manyBodyProperties m
        ]



--main svg


type alias MousePosition =
    { x : Int, y : Int }


mousePosition : Decoder MousePosition
mousePosition =
    Decode.map2 MousePosition
        (Decode.field "clientX" Decode.int)
        (Decode.field "clientY" Decode.int)


emptySvgElement =
    S.circle [] []


mainSvg : Model -> Html Msg
mainSvg m =
    let
        transparentInteractionRect =
            S.rect
                [ SA.fillOpacity "0"
                , SA.x "0"
                , SA.y "0"
                , SA.width "100%"
                , SA.height "100%"
                , HE.on "mousedown" <| Decode.map MouseDownOnTransparentInteractionRect mousePosition
                , HE.on "mouseup" <| Decode.map MouseUpOnTransparentInteractionRect mousePosition
                ]
                []

        maybeBrushedEdge =
            case m.tool of
                Draw (Just { sourceId, mousePos }) ->
                    case Graph.getVertex sourceId m.graph of
                        Just { x, y } ->
                            S.line
                                [ SA.x1 (String.fromFloat x)
                                , SA.x2 (String.fromInt mousePos.x)
                                , SA.y1 (String.fromFloat y)
                                , SA.y2 (String.fromInt mousePos.y)
                                , SA.strokeWidth (String.fromFloat m.edgePreferences.thickness)
                                , SA.stroke m.edgePreferences.color
                                ]
                                []

                        Nothing ->
                            emptySvgElement

                _ ->
                    emptySvgElement

        maybeBrushedSelectionRect =
            case m.tool of
                Select (BrushingForSelection { start, mousePos }) ->
                    case m.selector of
                        RectSelector ->
                            let
                                minx =
                                    toFloat (min start.x mousePos.x)

                                miny =
                                    toFloat (min start.y mousePos.y)

                                maxx =
                                    toFloat (max start.x mousePos.x)

                                maxy =
                                    toFloat (max start.y mousePos.y)
                            in
                            S.rect
                                [ SA.x (String.fromFloat minx)
                                , SA.y (String.fromFloat miny)
                                , SA.width (String.fromFloat (maxx - minx))
                                , SA.height (String.fromFloat (maxy - miny))
                                , SA.stroke "rgb(127,127,127)"
                                , SA.strokeWidth "1"
                                , SA.strokeDasharray "1 2"
                                , SA.fill "none"
                                ]
                                []

                        LineSelector ->
                            S.line
                                [ SA.x1 (String.fromInt start.x)
                                , SA.y1 (String.fromInt start.y)
                                , SA.x2 (String.fromInt mousePos.x)
                                , SA.y2 (String.fromInt mousePos.y)
                                , SA.stroke "rgb(127,127,127)"
                                , SA.strokeWidth "1"
                                , SA.strokeDasharray "1 2"
                                ]
                                []

                _ ->
                    emptySvgElement

        maybeRectAroundSelectedVertices =
            let
                rect selectedVertices =
                    let
                        maybeRectAroundVertices =
                            Graph.getMaybeRectAroundVertices
                                selectedVertices
                                m.graph
                    in
                    case maybeRectAroundVertices of
                        Just { x, y, width, height } ->
                            S.rect
                                [ SA.x (String.fromFloat (x - 1))
                                , SA.y (String.fromFloat (y - 1))
                                , SA.width (String.fromFloat (width + 2))
                                , SA.height (String.fromFloat (height + 2))
                                , SA.strokeWidth "1"
                                , SA.stroke "rgb(40,127,230)"
                                , SA.fill "none"
                                ]
                                []

                        Nothing ->
                            emptySvgElement
            in
            case m.tool of
                Select vertexSelectorState ->
                    case vertexSelectorState of
                        BrushingForSelection _ ->
                            emptySvgElement

                        _ ->
                            rect m.selectedVertices

                _ ->
                    emptySvgElement

        maybeHighlightsOnSelectedVertices =
            case m.tool of
                Select sVAction ->
                    let
                        hL color radius =
                            Graph.getVerticesIn m.selectedVertices m.graph
                                |> Dict.values
                                |> List.map
                                    (\v ->
                                        S.circle
                                            [ SA.cx (String.fromFloat v.x)
                                            , SA.cy (String.fromFloat v.y)
                                            , SA.r (String.fromFloat (radius v))
                                            , SA.stroke color
                                            , SA.strokeWidth "2"
                                            , SA.fill "none"
                                            ]
                                            []
                                    )
                                |> S.g []
                    in
                    case sVAction of
                        BrushingForSelection _ ->
                            hL "rgb(197,18,98)" .radius

                        _ ->
                            hL "rgb(40,129,230)" .radius

                _ ->
                    emptySvgElement

        maybeHighlightOnMouseOveredVertex =
            case m.highlightingVertexOnMouseOver of
                Just id ->
                    case Graph.getVertex id m.graph of
                        Just v ->
                            S.circle
                                [ SA.cx (String.fromFloat v.x)
                                , SA.cy (String.fromFloat v.y)
                                , SA.r (String.fromFloat v.radius)
                                , SA.stroke "rgb(197,18,98)"
                                , SA.strokeWidth "2"
                                , SA.fill "none"
                                ]
                                []

                        _ ->
                            -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE: The vertex should be there!" <|
                            emptySvgElement

                Nothing ->
                    emptySvgElement

        maybeHighlightsOnSelectedEdges =
            case m.tool of
                Select sVAction ->
                    let
                        hL color =
                            m.selectedEdges
                                |> Set.toList
                                |> List.map
                                    (\( s, t ) ->
                                        case
                                            ( m.graph |> Graph.getEdge ( s, t )
                                            , m.graph |> Graph.getVertex s
                                            , m.graph |> Graph.getVertex t
                                            )
                                        of
                                            ( Just e, Just v, Just w ) ->
                                                S.line
                                                    [ SA.stroke color
                                                    , SA.strokeWidth (String.fromFloat (e.thickness + 4))
                                                    , SA.x1 (String.fromFloat v.x)
                                                    , SA.y1 (String.fromFloat v.y)
                                                    , SA.x2 (String.fromFloat w.x)
                                                    , SA.y2 (String.fromFloat w.y)
                                                    ]
                                                    []

                                            _ ->
                                                -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE: They should be there!" <|
                                                emptySvgElement
                                    )
                                |> S.g []
                    in
                    case sVAction of
                        BrushingForSelection _ ->
                            hL "rgb(197,18,98)"

                        _ ->
                            hL "rgb(40,129,230)"

                _ ->
                    emptySvgElement

        maybeHighlightOnMouseOveredEdge =
            case m.highlightingEdgeOnMouseOver of
                Just ( s, t ) ->
                    case
                        ( m.graph |> Graph.getEdge ( s, t )
                        , m.graph |> Graph.getVertex s
                        , m.graph |> Graph.getVertex t
                        )
                    of
                        ( Just e, Just v, Just w ) ->
                            S.line
                                [ SA.stroke "rgb(197,18,98)"
                                , SA.strokeWidth (String.fromFloat (e.thickness + 4))
                                , SA.x1 (String.fromFloat v.x)
                                , SA.y1 (String.fromFloat v.y)
                                , SA.x2 (String.fromFloat w.x)
                                , SA.y2 (String.fromFloat w.y)
                                ]
                                []

                        _ ->
                            -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE: They should be there!" <|
                            emptySvgElement

                Nothing ->
                    emptySvgElement

        maybeHighlightOnVerticesOfMouseOveredBag =
            case m.highlightingBagOnMouseOver of
                Just bagId ->
                    m.graph
                        |> Graph.getVertices
                        |> Dict.filter (\_ v -> Set.member bagId v.inBags)
                        |> Dict.values
                        |> List.map
                            (\v ->
                                S.circle
                                    [ SA.cx (String.fromFloat v.x)
                                    , SA.cy (String.fromFloat v.y)
                                    , SA.r (String.fromFloat v.radius)
                                    , SA.stroke "rgb(197,18,98)"
                                    , SA.strokeWidth "2"
                                    , SA.fill "none"
                                    ]
                                    []
                            )
                        |> S.g []

                Nothing ->
                    emptySvgElement

        viewPullCenters =
            Graph.getBags m.graph
                |> Dict.map
                    (\bagId bag ->
                        let
                            ( xScale, yScale ) =
                                ( 10 * bag.pullXStrength
                                , 10 * bag.pullYStrength
                                )

                            ( arrowWidth, arrowHeight, distFromCenter ) =
                                ( 30, 20, 6 )

                            sep =
                                distFromCenter + arrowHeight

                            arrow =
                                S.polygon
                                    [ SA.points <|
                                        pointsForSvg
                                            [ ( -sep, -arrowWidth / 2 )
                                            , ( -sep, arrowWidth / 2 )
                                            , ( -distFromCenter, 0 )
                                            ]
                                    ]
                                    []

                            rectX =
                                S.rect
                                    [ SA.x (String.fromFloat (-sep - xScale * 20))
                                    , SA.y "-5"
                                    , SA.width (String.fromFloat (xScale * 20))
                                    , SA.height "10"
                                    ]
                                    []

                            rectY =
                                S.rect
                                    [ SA.x "-5"
                                    , SA.y (String.fromFloat (-sep - yScale * 20))
                                    , SA.width "10"
                                    , SA.height (String.fromFloat (yScale * 20))
                                    ]
                                    []

                            rotate angle element =
                                S.g
                                    [ SA.transform <| "rotate(" ++ String.fromFloat angle ++ ",0,0)" ]
                                    [ element ]
                        in
                        S.g
                            [ SA.display <|
                                if bag.draggablePullCenter then
                                    "inline"

                                else
                                    "none"
                            , SA.transform <| "translate(" ++ String.fromFloat bag.pullX ++ "," ++ String.fromFloat bag.pullY ++ ")"
                            , SA.opacity "0.4"
                            , SA.class "pullCenter"
                            , HE.on "mousedown" <| Decode.map (MouseDownOnPullCenter bagId) mousePosition
                            , SE.onMouseOver (MouseOverPullCenter bagId)
                            , SE.onMouseOut (MouseOutPullCenter bagId)
                            , SE.onClick (ClickOnPullCenter bagId)
                            , SA.fill <|
                                if
                                    m.highlightingPullCenterOnMouseOver
                                        == Just bagId
                                then
                                    "rgb(40,129,230\n"

                                else if
                                    m.maybeSelectedBag
                                        == Just bagId
                                then
                                    "rgb(40,129,230\n"

                                else
                                    "gray"
                            ]
                            [ arrow
                            , rotate 90 arrow
                            , rotate 180 arrow
                            , rotate 270 arrow
                            , rectX
                            , rotate 180 rectX
                            , rectY
                            , rotate 180 rectY
                            ]
                    )
                |> Dict.values
                |> S.g []

        cursor =
            case m.tool of
                Draw _ ->
                    "crosshair"

                Select _ ->
                    "default"
    in
    S.svg
        [ HA.style "background-color" "rgb(46, 46, 46)"
        , HA.style "position" "absolute"
        , HA.style "width" "100%"
        , HA.style "height" "100%"
        , HA.style "cursor" cursor
        ]
        [ viewHulls m.graph
        , maybeBrushedEdge
        , transparentInteractionRect
        , viewPullCenters
        , maybeHighlightsOnSelectedEdges
        , maybeHighlightOnMouseOveredEdge
        , viewEdges m.graph
        , viewVertices m.graph
        , maybeBrushedSelectionRect
        , maybeRectAroundSelectedVertices
        , maybeHighlightsOnSelectedVertices
        , maybeHighlightOnMouseOveredVertex
        , maybeHighlightOnVerticesOfMouseOveredBag
        ]



-- GRAPH VIEW


viewEdges : Graph -> Html Msg
viewEdges graph =
    let
        vertices =
            graph |> Graph.getVertices

        edges =
            graph |> Graph.getEdges

        drawEdge ( s, t ) { color, thickness } =
            case ( Dict.get s vertices, Dict.get t vertices ) of
                ( Just v, Just w ) ->
                    S.g
                        [ HE.on "mousedown" <|
                            Decode.map (MouseDownOnEdge ( s, t ))
                                mousePosition
                        , HE.on "mouseup" <|
                            Decode.map (MouseUpOnEdge ( s, t ))
                                mousePosition
                        , SE.onMouseOver (MouseOverEdge ( s, t ))
                        , SE.onMouseOut (MouseOutEdge ( s, t ))
                        ]
                        [ S.line
                            [ SA.stroke color
                            , SA.strokeWidth (String.fromFloat thickness)
                            , SA.x1 (String.fromFloat v.x)
                            , SA.y1 (String.fromFloat v.y)
                            , SA.x2 (String.fromFloat w.x)
                            , SA.y2 (String.fromFloat w.y)
                            ]
                            []
                        , S.line
                            [ SA.stroke "red"
                            , SA.strokeWidth (String.fromFloat (max 20 thickness))
                            , SA.strokeOpacity "0"
                            , SA.x1 (String.fromFloat v.x)
                            , SA.y1 (String.fromFloat v.y)
                            , SA.x2 (String.fromFloat w.x)
                            , SA.y2 (String.fromFloat w.y)
                            ]
                            []
                        ]

                _ ->
                    -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE" <|
                    emptySvgElement

        es =
            edges
                |> Dict.map drawEdge
                |> Dict.values
    in
    S.g [] es


viewVertices : Graph -> Html Msg
viewVertices graph =
    let
        vertices =
            graph |> Graph.getVertices

        pin fixed radius =
            if fixed then
                S.circle
                    [ SA.r (String.fromFloat (radius / 2))
                    , SA.fill "red"
                    , SA.stroke "white"
                    ]
                    []

            else
                S.g [] []

        drawVertex id { x, y, color, radius, fixed } =
            S.g
                [ SA.transform <| "translate(" ++ String.fromFloat x ++ "," ++ String.fromFloat y ++ ")"
                , HE.on "mousedown" <| Decode.map (MouseDownOnVertex id) mousePosition
                , SE.onMouseUp (MouseUpOnVertex id)
                , SE.onMouseOver (MouseOverVertex id)
                , SE.onMouseOut (MouseOutVertex id)
                ]
                [ S.circle
                    [ SA.r (String.fromFloat radius)
                    , SA.fill color
                    ]
                    []
                , pin fixed radius
                ]

        vs =
            vertices
                |> Dict.map drawVertex
                |> Dict.values
    in
    S.g [] vs


pointsForSvg : List ( Float, Float ) -> String
pointsForSvg =
    List.map (\( x, y ) -> String.fromFloat x ++ "," ++ String.fromFloat y ++ " ")
        >> String.concat


viewHulls : Graph -> Html Msg
viewHulls graph =
    let
        hull : List ( Float, Float ) -> Html a
        hull positions =
            S.polygon
                [ SA.points <| pointsForSvg (ConvexHull.convexHull positions)
                , SA.fill "lightGray"
                , SA.opacity "0.3"
                , SA.stroke "lightGray"
                , SA.strokeWidth "50"
                , SA.strokeLinejoin "round"
                ]
                []

        hasConvexHull bagId =
            graph
                |> Graph.getBags
                |> Dict.get bagId
                |> Maybe.map .hasConvexHull
                |> Maybe.withDefault False

        hulls =
            graph
                |> Graph.getBagsWithVertices
                |> Dict.filter (\bagId _ -> hasConvexHull bagId)
                |> Dict.values
                |> List.map (List.map (\v -> ( v.x, v.y )))
                |> List.map hull
    in
    S.g [] hulls
