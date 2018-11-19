module Main exposing (main)

import BoundingBox2d exposing (BoundingBox2d)
import Browser
import Browser.Dom as Dom
import Browser.Events exposing (Visibility(..))
import Circle2d exposing (Circle2d)
import Colors
import Dict exposing (Dict)
import Direction2d exposing (Direction2d)
import Element as El exposing (Color, Element)
import Element.Background as Background
import Element.Border as Border
import Element.Events as Events
import Element.Font as Font
import Element.Input as Input
import Element.Keyed
import Files exposing (Files)
import Geometry.Svg
import Graph.Force as Force exposing (Force)
import GraphFile as GF exposing (BagId, BagProperties, EdgeId, EdgeProperties, GraphFile, VertexId, VertexProperties)
import Html as H exposing (Html, div)
import Html.Attributes as HA
import Html.Events as HE
import Icons exposing (icons)
import IntDict exposing (IntDict)
import Json.Decode as Decode exposing (Decoder, Value)
import LineSegment2d exposing (LineSegment2d)
import Point2d exposing (Point2d)
import Polygon2d exposing (Polygon2d)
import Set exposing (Set)
import Svg as S
import Svg.Attributes as SA
import Svg.Events as SE
import Svg.Keyed
import Task
import Time
import Vector2d exposing (Vector2d)


main : Program () Model Msg
main =
    Browser.document
        { init =
            always
                ( initialModel GF.default
                , Task.perform WindowResize (Task.map getWindowSize Dom.getViewport)
                )
        , view = \m -> { title = "Kite", body = [ mainSvg m, view m ] }
        , update = \msg m -> ( update msg m, Cmd.none )
        , subscriptions = subscriptions
        }


getWindowSize viewPort =
    { width = round viewPort.scene.width
    , height = round viewPort.scene.height
    }


mousePosition : Decoder MousePosition
mousePosition =
    Decode.map2 MousePosition
        (Decode.field "clientX" Decode.int)
        (Decode.field "clientY" Decode.int)



-- MODEL


type alias Model =
    { files : Files ( String, GraphFile )

    --
    , distractionFree : Bool

    --
    , focusIsOnSomeTextInput : {- needed for preventing keypresses to trigger keyboard shortcuts -} Bool

    --
    , simulationState : Force.State

    --
    , timeList : List Time.Posix

    --
    , windowSize : { width : Int, height : Int }
    , mousePosition : MousePosition
    , svgMousePosition : Point2d

    --
    , altIsDown : Bool
    , shiftIsDown : Bool

    --
    , pan : {- This is the svg coordinates of the top left corner of the browser window -} Point2d
    , zoom : Float

    --
    , vaderIsOn : Bool

    --
    , vertexColorPickerIsExpanded : Bool
    , edgeColorPickerIsExpanded : Bool
    , bagColorPickerIsExpanded : Bool

    --
    , selectedMode : Mode

    --
    , tableOfVerticesIsOn : Bool
    , tableOfEdgesIsOn : Bool

    --
    , historyIsOn : Bool
    , selectorIsOn : Bool
    , bagsIsOn : Bool
    , vertexPreferencesIsOn : Bool
    , edgePreferencesIsOn : Bool

    --
    , selectedTool : Tool

    --
    , selectedSelector : Selector

    --
    , maybeSelectedBag : Maybe BagId

    --
    , highlightedVertices : Set VertexId
    , highlightedEdges : Set EdgeId

    --
    , selectedVertices : Set VertexId
    , selectedEdges : Set EdgeId
    }


type Mode
    = Files
    | ListsOfBagsVerticesAndEdges
    | GraphOperations
    | GraphQueries
    | GraphGenerators
    | AlgorithmVisualizations
    | GamesOnGraphs
    | Preferences


type Selector
    = RectSelector
    | LineSelector


type Tool
    = Hand HandState
    | Draw DrawState
    | Select SelectState
    | Gravity GravityState


type alias Pan =
    Point2d


type HandState
    = HandIdle
    | Panning
        { mousePositionAtPanStart : MousePosition
        , panAtStart : Pan
        }


type DrawState
    = DrawIdle
    | BrushingNewEdgeWithSourceId VertexId


type alias MousePosition =
    { x : Int, y : Int }


type SelectState
    = SelectIdle
    | BrushingForSelection { brushStart : Point2d }
    | DraggingSelection
        { brushStart : Point2d
        , vertexPositionsAtStart : IntDict Point2d
        }


type GravityState
    = GravityIdle
    | GravityDragging


initialModel : GraphFile -> Model
initialModel graphFile =
    { files =
        Files.empty
            |> Files.new "my-first-graph"
                ( "Started with empty graph", graphFile )

    --
    , distractionFree = True

    --
    , focusIsOnSomeTextInput = False

    --
    , simulationState =
        Force.simulation
            [ Force.Link
            , Force.ManyBody 0.9
            , Force.Gravity
            ]

    --
    , timeList = []
    , windowSize = { width = 800, height = 600 }
    , mousePosition = { x = 0, y = 0 }
    , svgMousePosition = Point2d.fromCoordinates ( 0, 0 )

    --
    , altIsDown = False
    , shiftIsDown = False

    --
    , pan = initialPan
    , zoom = 1

    --
    , vaderIsOn = True

    --
    , vertexColorPickerIsExpanded = False
    , edgeColorPickerIsExpanded = False
    , bagColorPickerIsExpanded = False

    --
    , selectedMode = ListsOfBagsVerticesAndEdges

    --
    , tableOfVerticesIsOn = True
    , tableOfEdgesIsOn = True

    --
    , historyIsOn = True
    , selectorIsOn = True
    , bagsIsOn = True
    , vertexPreferencesIsOn = True
    , edgePreferencesIsOn = True

    --
    , selectedTool = Draw DrawIdle

    --
    , selectedSelector = RectSelector

    --
    , maybeSelectedBag = Nothing

    --
    , highlightedVertices = Set.empty
    , highlightedEdges = Set.empty

    --
    , selectedVertices = Set.empty
    , selectedEdges = Set.empty
    }


initialPan =
    Point2d.fromCoordinates
        ( -layoutParams.leftStripeWidth - layoutParams.leftBarWidth - 50
        , -layoutParams.topBarHeight - 50
        )



--  UPDATE


type Msg
    = NoOp
      --
    | Tick Time.Posix
      --
    | WindowResize { width : Int, height : Int }
      --
    | FocusedATextInput
    | FocusLostFromTextInput
      --
    | WheelDeltaY Int
      --
    | KeyDownAlt
    | KeyUpAlt
    | KeyDownShift
    | KeyUpShift
      --
    | PageVisibility Browser.Events.Visibility
      --
    | ClickOnDistractionFreeButton
      --
    | ClickOnLeftMostBarRadioButton Mode
      --
    | ClickOnUndoButton
    | ClickOnRedoButton
    | ClickOnHistoryItem Int
      --
    | ClickOnResetZoomAndPanButton
      --
    | ClickOnHandTool
    | ClickOnDrawTool
    | ClickOnSelectTool
      --
    | ClickOnVader
      --
    | ClickOnVertexColorPicker
    | ClickOnEdgeColorPicker
    | ClickOnBagColorPicker
    | MouseLeaveVertexColorPicker
    | MouseLeaveEdgeColorPicker
    | MouseLeaveBagColorPicker
      --
    | ClickOnRectSelector
    | ClickOnLineSelector
      --
    | MouseMove MousePosition
    | MouseMoveForUpdatingSvgPos MousePosition
    | MouseUp MousePosition
      --
    | MouseDownOnTransparentInteractionRect
    | MouseUpOnTransparentInteractionRect
      --
    | MouseDownOnMainSvg
      --
    | MouseOverVertex VertexId
    | MouseOutVertex VertexId
    | MouseDownOnVertex VertexId
    | MouseUpOnVertex VertexId
      --
    | MouseOverEdge EdgeId
    | MouseOutEdge EdgeId
    | MouseDownOnEdge EdgeId
    | MouseUpOnEdge EdgeId
      --
    | MouseDownOnGravityCenter (List VertexId)
    | MouseDownOnDefaultGravityCenter
      --
    | ToggleTableOfVertices
    | ToggleTableOfEdges
      --
    | ToggleHistory
    | ToggleSelector
    | ToggleBags
    | ToggleVertexPreferences
    | ToggleEdgePreferences
      --
    | ClickOnBagPlus
    | ClickOnBagTrash
    | MouseOverBagItem BagId
    | MouseOutBagItem BagId
    | ClickOnBagItem BagId
      --
    | ClickOnVertexTrash
    | MouseOverVertexItem VertexId
    | MouseOutVertexItem VertexId
    | ClickOnVertexItem VertexId
      --
    | ClickOnEdgeContract
    | ClickOnEdgeTrash
    | MouseOverEdgeItem EdgeId
    | MouseOutEdgeItem EdgeId
    | ClickOnEdgeItem EdgeId
      --
    | InputBagLabel BagId String
    | InputBagConvexHull BagId Bool
    | InputBagColor BagId Color
      --
    | InputVertexLabel String
    | InputVertexLabelVisibility Bool
    | InputVertexX String
    | InputVertexY String
    | InputVertexRadius Float
    | InputVertexGravityStrength Float
    | InputVertexCharge Float
    | InputVertexFixed Bool
    | InputVertexColor Color
    | ClickOnGravityTool
      --
    | InputEdgeLabel String
    | InputEdgeLabelVisibility Bool
    | InputEdgeThickness Float
    | InputEdgeDistance Float
    | InputEdgeStrength Float
    | InputEdgeColor Color
      --
    | ClickOnGenerateStarGraphButton
      --
    | ClickOnNewFile


reheatSimulation : Model -> Model
reheatSimulation m =
    if m.vaderIsOn then
        { m | simulationState = Force.reheat m.simulationState }

    else
        m


stopSimulation : Model -> Model
stopSimulation m =
    { m | simulationState = Force.stop m.simulationState }


presentFile : Model -> GraphFile
presentFile m =
    Tuple.second (Files.present m.files)


setPresent : GraphFile -> String -> Model -> Model
setPresent newFile description m =
    { m | files = m.files |> Files.set ( description, newFile ) }


setPresentWithoutrecording : GraphFile -> Model -> Model
setPresentWithoutrecording newFile m =
    { m
        | files =
            m.files |> Files.mapPresent (Tuple.mapSecond (always newFile))
    }


newFileAfterApllyingGravity : Model -> GraphFile
newFileAfterApllyingGravity m =
    let
        updateGravity v =
            { v | gravityCenter = m.svgMousePosition }
    in
    if Set.isEmpty m.selectedVertices then
        presentFile m
            |> GF.updateDefaultVertexProperties updateGravity

    else
        presentFile m
            |> GF.updateVertices m.selectedVertices updateGravity


update : Msg -> Model -> Model
update msg m =
    case msg of
        NoOp ->
            m

        Tick t ->
            let
                ( newSimulationState, newFile_ ) =
                    presentFile m |> GF.tick m.simulationState

                newFile =
                    case m.selectedTool of
                        Select (DraggingSelection { brushStart, vertexPositionsAtStart }) ->
                            let
                                delta =
                                    Vector2d.from brushStart m.svgMousePosition

                                newVertexPositions =
                                    vertexPositionsAtStart
                                        |> IntDict.toList
                                        |> List.map (Tuple.mapSecond (Point2d.translateBy delta))
                            in
                            newFile_ |> GF.setVertexPositions newVertexPositions

                        _ ->
                            newFile_
            in
            { m
                | simulationState = newSimulationState
                , timeList = t :: m.timeList |> List.take 42
            }
                |> setPresentWithoutrecording newFile

        WindowResize wS ->
            { m | windowSize = wS }

        FocusedATextInput ->
            { m | focusIsOnSomeTextInput = True }

        FocusLostFromTextInput ->
            { m | focusIsOnSomeTextInput = False }

        WheelDeltaY deltaY ->
            let
                zoomDelta =
                    m.zoom + 0.001 * toFloat -deltaY

                newZoom =
                    clamp 0.5 2 zoomDelta
            in
            { m
                | zoom = newZoom
                , pan = m.pan |> Point2d.scaleAbout m.svgMousePosition (m.zoom / newZoom)
            }

        KeyDownAlt ->
            { m | altIsDown = True }

        KeyUpAlt ->
            { m | altIsDown = False }

        KeyDownShift ->
            { m | shiftIsDown = True }

        KeyUpShift ->
            { m | shiftIsDown = False }

        PageVisibility visibility ->
            {- TODO : This does not work, I don't know why. Google this. -}
            case visibility of
                Hidden ->
                    { m
                        | shiftIsDown = False
                        , altIsDown = False
                    }

                Visible ->
                    m

        ClickOnDistractionFreeButton ->
            { m | distractionFree = not m.distractionFree }

        ClickOnLeftMostBarRadioButton selectedMode ->
            { m | selectedMode = selectedMode }

        ClickOnUndoButton ->
            reheatSimulation
                { m | files = m.files |> Files.undo }

        ClickOnRedoButton ->
            reheatSimulation
                { m | files = m.files |> Files.redo }

        ClickOnHistoryItem i ->
            reheatSimulation
                { m | files = m.files |> Files.goTo i }

        ClickOnResetZoomAndPanButton ->
            { m
                | pan = initialPan
                , zoom = 1
            }

        ClickOnHandTool ->
            { m | selectedTool = Hand HandIdle }

        ClickOnDrawTool ->
            { m | selectedTool = Draw DrawIdle }

        ClickOnSelectTool ->
            { m | selectedTool = Select SelectIdle }

        ClickOnGravityTool ->
            { m | selectedTool = Gravity GravityIdle }

        ClickOnVader ->
            reheatSimulation
                { m | vaderIsOn = not m.vaderIsOn }

        ClickOnVertexColorPicker ->
            { m | vertexColorPickerIsExpanded = not m.vertexColorPickerIsExpanded }

        ClickOnEdgeColorPicker ->
            { m | edgeColorPickerIsExpanded = not m.edgeColorPickerIsExpanded }

        ClickOnBagColorPicker ->
            { m | bagColorPickerIsExpanded = not m.bagColorPickerIsExpanded }

        MouseLeaveVertexColorPicker ->
            { m | vertexColorPickerIsExpanded = False }

        MouseLeaveEdgeColorPicker ->
            { m | edgeColorPickerIsExpanded = False }

        MouseLeaveBagColorPicker ->
            { m | bagColorPickerIsExpanded = False }

        ClickOnRectSelector ->
            { m
                | selectedSelector = RectSelector
                , selectedTool = Select SelectIdle
            }

        ClickOnLineSelector ->
            { m
                | selectedSelector = LineSelector
                , selectedTool = Select SelectIdle
            }

        MouseMove newMousePosition ->
            case m.selectedTool of
                Select (BrushingForSelection { brushStart }) ->
                    case m.selectedSelector of
                        RectSelector ->
                            let
                                newSelectedVertices =
                                    GF.vertexIdsInBoundingBox
                                        (BoundingBox2d.from brushStart m.svgMousePosition)
                                        (presentFile m)
                            in
                            { m
                                | selectedVertices = newSelectedVertices
                                , selectedEdges = presentFile m |> GF.inducedEdges newSelectedVertices
                            }

                        LineSelector ->
                            let
                                newSelectedEdges =
                                    GF.edgeIdsIntersectiongLineSegment
                                        (LineSegment2d.from brushStart m.svgMousePosition)
                                        (presentFile m)
                            in
                            { m
                                | selectedEdges = newSelectedEdges
                                , selectedVertices = GF.inducedVertices newSelectedEdges
                            }

                Select (DraggingSelection { brushStart, vertexPositionsAtStart }) ->
                    let
                        delta =
                            Vector2d.from brushStart m.svgMousePosition

                        newVertexPositions =
                            vertexPositionsAtStart
                                |> IntDict.toList
                                |> List.map (Tuple.mapSecond (Point2d.translateBy delta))

                        newFile =
                            presentFile m
                                |> GF.setVertexPositions newVertexPositions
                    in
                    m |> setPresentWithoutrecording newFile

                Hand (Panning { mousePositionAtPanStart, panAtStart }) ->
                    { m
                        | pan =
                            let
                                toPoint : { x : Int, y : Int } -> Point2d
                                toPoint pos =
                                    Point2d.fromCoordinates ( toFloat pos.x, toFloat pos.y )

                                delta =
                                    Vector2d.from (toPoint newMousePosition) (toPoint mousePositionAtPanStart)
                                        |> Vector2d.scaleBy (1 / m.zoom)
                            in
                            panAtStart |> Point2d.translateBy delta
                    }

                Gravity GravityDragging ->
                    let
                        newFile =
                            newFileAfterApllyingGravity m
                    in
                    m
                        |> reheatSimulation
                        |> setPresentWithoutrecording newFile

                _ ->
                    m

        MouseMoveForUpdatingSvgPos newMousePosition ->
            let
                panAsVector =
                    m.pan |> Point2d.coordinates |> Vector2d.fromComponents

                newSvgMousePosition =
                    Point2d.fromCoordinates
                        ( toFloat newMousePosition.x
                          --- layoutParams.leftStripeWidth - layoutParams.leftBarWidth
                        , toFloat newMousePosition.y
                          --- layoutParams.topBarHeight
                        )
                        |> Point2d.scaleAbout Point2d.origin (1 / m.zoom)
                        |> Point2d.translateBy panAsVector
            in
            { m
                | svgMousePosition = newSvgMousePosition
                , mousePosition = newMousePosition
            }

        MouseUp _ ->
            case m.selectedTool of
                Select (BrushingForSelection { brushStart }) ->
                    let
                        ( newSelectedVertices, newSelectedEdges ) =
                            if brushStart == m.svgMousePosition then
                                ( Set.empty, Set.empty )

                            else
                                ( m.selectedVertices, m.selectedEdges )
                    in
                    { m
                        | selectedTool = Select SelectIdle
                        , selectedVertices = newSelectedVertices
                        , selectedEdges = newSelectedEdges
                    }

                Select (DraggingSelection _) ->
                    { m
                        | simulationState = m.simulationState |> Force.alphaTarget 0
                        , selectedTool = Select SelectIdle
                    }
                        |> setPresent (presentFile m)
                            "Moved some vertices"

                Hand (Panning _) ->
                    { m | selectedTool = Hand HandIdle }

                Gravity GravityDragging ->
                    let
                        newFile =
                            newFileAfterApllyingGravity m
                    in
                    { m | selectedTool = Gravity GravityIdle }
                        |> setPresent newFile
                            "Changed gravity center of some vertices"

                _ ->
                    m

        MouseDownOnTransparentInteractionRect ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newFile, sourceId ) =
                            presentFile m |> GF.addVertex m.svgMousePosition
                    in
                    { m
                        | selectedTool = Draw (BrushingNewEdgeWithSourceId sourceId)
                    }
                        |> stopSimulation
                        |> setPresent newFile
                            ("Added vertex " ++ vertexIdToString sourceId)

                Select SelectIdle ->
                    { m | selectedTool = Select (BrushingForSelection { brushStart = m.svgMousePosition }) }

                _ ->
                    m

        MouseUpOnTransparentInteractionRect ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    let
                        ( graphWithAddedVertex, newId ) =
                            presentFile m
                                |> GF.addVertex m.svgMousePosition

                        newFile =
                            graphWithAddedVertex
                                |> GF.addEdge ( sourceId, newId )
                    in
                    { m | selectedTool = Draw DrawIdle }
                        |> reheatSimulation
                        |> setPresent newFile
                            ("Added vertex "
                                ++ vertexIdToString newId
                                ++ " and edge "
                                ++ edgeIdToString ( sourceId, newId )
                            )

                _ ->
                    m

        MouseDownOnMainSvg ->
            case m.selectedTool of
                Hand HandIdle ->
                    { m
                        | selectedTool =
                            Hand
                                (Panning
                                    { mousePositionAtPanStart = m.mousePosition
                                    , panAtStart = m.pan
                                    }
                                )
                    }

                Gravity GravityIdle ->
                    let
                        newFile =
                            newFileAfterApllyingGravity m
                    in
                    { m | selectedTool = Gravity GravityDragging }
                        |> reheatSimulation
                        |> setPresent newFile
                            "Changed gravity center of some vertices"

                _ ->
                    m

        MouseOverVertex id ->
            { m | highlightedVertices = Set.singleton id }

        MouseOutVertex _ ->
            { m | highlightedVertices = Set.empty }

        MouseOverEdge edgeId ->
            { m | highlightedEdges = Set.singleton edgeId }

        MouseOutEdge _ ->
            { m | highlightedEdges = Set.empty }

        MouseDownOnVertex id ->
            case m.selectedTool of
                Draw DrawIdle ->
                    { m | selectedTool = Draw (BrushingNewEdgeWithSourceId id) }

                Select SelectIdle ->
                    if Set.member id m.selectedVertices then
                        if m.altIsDown then
                            let
                                ( newFile, newSelectedVertices, newSelectedEdges ) =
                                    presentFile m
                                        |> GF.duplicateSubgraph m.selectedVertices m.selectedEdges
                            in
                            { m
                                | selectedVertices = newSelectedVertices
                                , selectedEdges = newSelectedEdges
                                , selectedTool =
                                    Select
                                        (DraggingSelection
                                            { brushStart = m.svgMousePosition
                                            , vertexPositionsAtStart =
                                                newFile
                                                    |> GF.getVertexIdsWithPositions newSelectedVertices
                                            }
                                        )
                                , simulationState = m.simulationState |> Force.alphaTarget 0.3
                            }
                                |> stopSimulation
                                |> setPresent newFile "Duplicated a subgraph"

                        else
                            { m
                                | selectedTool =
                                    Select
                                        (DraggingSelection
                                            { brushStart = m.svgMousePosition
                                            , vertexPositionsAtStart =
                                                presentFile m
                                                    |> GF.getVertexIdsWithPositions m.selectedVertices
                                            }
                                        )
                                , simulationState = m.simulationState |> Force.alphaTarget 0.3
                            }
                                |> reheatSimulation

                    else
                        let
                            newSelectedVertices =
                                Set.singleton id
                        in
                        { m
                            | selectedVertices = newSelectedVertices
                            , selectedEdges = Set.empty
                            , selectedTool =
                                Select
                                    (DraggingSelection
                                        { brushStart = m.svgMousePosition
                                        , vertexPositionsAtStart =
                                            presentFile m
                                                |> GF.getVertexIdsWithPositions newSelectedVertices
                                        }
                                    )
                            , simulationState = m.simulationState |> Force.alphaTarget 0.3
                        }
                            |> reheatSimulation

                _ ->
                    m

        MouseUpOnVertex targetId ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    if sourceId == targetId then
                        { m | selectedTool = Draw DrawIdle }
                            |> reheatSimulation

                    else
                        let
                            newFile =
                                presentFile m
                                    |> GF.addEdge ( sourceId, targetId )
                        in
                        { m | selectedTool = Draw DrawIdle }
                            |> reheatSimulation
                            |> setPresent newFile
                                ("Added edge "
                                    ++ edgeIdToString ( sourceId, targetId )
                                )

                _ ->
                    m

        MouseDownOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newFile, newId ) =
                            presentFile m
                                |> GF.divideEdge m.svgMousePosition ( s, t )
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedTool = Draw (BrushingNewEdgeWithSourceId newId)
                    }
                        |> stopSimulation
                        |> setPresent newFile
                            ("Divided Edge "
                                ++ edgeIdToString ( s, t )
                                ++ " by vertex "
                                ++ vertexIdToString newId
                            )

                Select SelectIdle ->
                    if Set.member ( s, t ) m.selectedEdges then
                        if m.altIsDown then
                            let
                                ( newFile, newSelectedVertices, newSelectedEdges ) =
                                    presentFile m
                                        |> GF.duplicateSubgraph m.selectedVertices m.selectedEdges
                            in
                            { m
                                | selectedVertices = newSelectedVertices
                                , selectedEdges = newSelectedEdges
                                , selectedTool =
                                    Select
                                        (DraggingSelection
                                            { brushStart = m.svgMousePosition
                                            , vertexPositionsAtStart = newFile |> GF.getVertexIdsWithPositions newSelectedVertices
                                            }
                                        )
                                , simulationState = m.simulationState |> Force.alphaTarget 0.3
                            }
                                |> stopSimulation
                                |> setPresent newFile "Duplicated a subgraph"

                        else
                            { m
                                | selectedTool =
                                    Select
                                        (DraggingSelection
                                            { brushStart = m.svgMousePosition
                                            , vertexPositionsAtStart =
                                                presentFile m
                                                    |> GF.getVertexIdsWithPositions m.selectedVertices
                                            }
                                        )
                                , simulationState = m.simulationState |> Force.alphaTarget 0.3
                            }
                                |> reheatSimulation

                    else
                        let
                            newSelectedVertices =
                                Set.fromList [ s, t ]
                        in
                        { m
                            | selectedVertices = newSelectedVertices
                            , selectedEdges = Set.singleton ( s, t )
                            , selectedTool =
                                Select
                                    (DraggingSelection
                                        { brushStart = m.svgMousePosition
                                        , vertexPositionsAtStart =
                                            presentFile m
                                                |> GF.getVertexIdsWithPositions newSelectedVertices
                                        }
                                    )
                            , simulationState = m.simulationState |> Force.alphaTarget 0.3
                        }
                            |> reheatSimulation

                _ ->
                    m

        MouseUpOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    let
                        ( newFile_, newId ) =
                            presentFile m
                                |> GF.divideEdge m.svgMousePosition ( s, t )

                        newFile =
                            newFile_ |> GF.addEdge ( sourceId, newId )
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedTool = Draw DrawIdle
                    }
                        |> reheatSimulation
                        |> setPresent newFile
                            ("Divided Edge "
                                ++ edgeIdToString ( s, t )
                                ++ " by adding vertex "
                                ++ vertexIdToString newId
                                ++ " and added edge "
                                ++ edgeIdToString ( sourceId, newId )
                            )

                _ ->
                    m

        MouseDownOnGravityCenter idList ->
            { m | selectedVertices = Set.fromList idList }

        MouseDownOnDefaultGravityCenter ->
            { m | selectedVertices = Set.empty }

        InputBagLabel bagId str ->
            let
                updateLabel bag =
                    { bag
                        | label =
                            if str == "" then
                                Nothing

                            else
                                Just str
                    }

                newFile =
                    presentFile m |> GF.updateBag bagId updateLabel
            in
            m
                |> setPresent newFile
                    "Changed the label of the bag"

        InputBagConvexHull bagId b ->
            let
                updateCH bag =
                    { bag | hasConvexHull = b }

                newFile =
                    presentFile m |> GF.updateBag bagId updateCH
            in
            m
                |> setPresent newFile
                    "Toggled convex hull of a bag"

        InputBagColor bagId color ->
            let
                updateColor bag =
                    { bag | color = color }

                newFile =
                    presentFile m |> GF.updateBag bagId updateColor
            in
            m
                |> setPresent newFile
                    "Changed color of a bag"

        InputVertexX str ->
            let
                newFile =
                    presentFile m
                        |> GF.setCentroidX m.selectedVertices
                            (str |> String.toFloat |> Maybe.withDefault 0)
            in
            m
                |> setPresent newFile
                    "Changed the X coordinate of vertices"

        InputVertexY str ->
            let
                newFile =
                    presentFile m
                        |> GF.setCentroidY m.selectedVertices
                            (str |> String.toFloat |> Maybe.withDefault 0)
            in
            m
                |> setPresent newFile
                    "Changed the Y coordinate of some vertices"

        InputVertexColor newColor ->
            let
                updateColor v =
                    { v | color = newColor }

                ( newFile, description ) =
                    if Set.isEmpty m.selectedVertices then
                        ( presentFile m
                            |> GF.updateDefaultVertexProperties updateColor
                        , "Changed the color of some vertices"
                        )

                    else
                        ( presentFile m
                            |> GF.updateVertices m.selectedVertices updateColor
                        , "Changed the default vertex color"
                        )
            in
            m
                |> setPresent newFile description

        InputVertexRadius num ->
            let
                updateRadius v =
                    { v | radius = num }

                newFile =
                    if Set.isEmpty m.selectedVertices then
                        presentFile m
                            |> GF.updateDefaultVertexProperties updateRadius

                    else
                        presentFile m
                            |> GF.updateVertices m.selectedVertices updateRadius
            in
            m
                |> setPresent newFile
                    "Changed the radius of some vertices"

        InputVertexGravityStrength num ->
            let
                updateGravityStrength v =
                    { v | gravityStrength = num }

                newFile =
                    if Set.isEmpty m.selectedVertices then
                        presentFile m
                            |> GF.updateDefaultVertexProperties updateGravityStrength

                    else
                        presentFile m
                            |> GF.updateVertices m.selectedVertices updateGravityStrength
            in
            m
                |> reheatSimulation
                |> setPresent newFile
                    "Changed gravity strength of some vertices"

        InputVertexCharge num ->
            let
                updateManyBodyStrength v =
                    { v | manyBodyStrength = -1 * num }

                newFile =
                    if Set.isEmpty m.selectedVertices then
                        presentFile m
                            |> GF.updateDefaultVertexProperties updateManyBodyStrength

                    else
                        presentFile m
                            |> GF.updateVertices m.selectedVertices updateManyBodyStrength
            in
            m
                |> reheatSimulation
                |> setPresent newFile
                    "Changed the strength of some vertices"

        InputVertexLabel str ->
            let
                updateLabel v =
                    { v
                        | label =
                            if str == "" then
                                Nothing

                            else
                                Just str
                    }

                newFile =
                    if Set.isEmpty m.selectedVertices then
                        presentFile m
                            |> GF.updateDefaultVertexProperties updateLabel

                    else
                        presentFile m
                            |> GF.updateVertices m.selectedVertices updateLabel
            in
            m
                |> setPresent newFile
                    "Changed the label of some vertices"

        InputVertexFixed b ->
            let
                updateFixed v =
                    { v | fixed = b }

                newFile =
                    if Set.isEmpty m.selectedVertices then
                        presentFile m
                            |> GF.updateDefaultVertexProperties updateFixed

                    else
                        presentFile m
                            |> GF.updateVertices m.selectedVertices updateFixed

                descriptionStart =
                    if b then
                        "Fixed vertices "

                    else
                        "Released vertices "
            in
            m
                |> reheatSimulation
                |> setPresent newFile
                    (descriptionStart
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                    )

        InputVertexLabelVisibility b ->
            let
                updateLabelVisibility v =
                    { v | labelIsVisible = b }

                newFile =
                    if Set.isEmpty m.selectedVertices then
                        presentFile m
                            |> GF.updateDefaultVertexProperties updateLabelVisibility

                    else
                        presentFile m
                            |> GF.updateVertices m.selectedVertices updateLabelVisibility
            in
            m
                |> setPresent newFile
                    "Toggled the labels of some edges"

        InputEdgeLabelVisibility b ->
            let
                updateLabelVisibility v =
                    { v | labelIsVisible = b }

                newFile =
                    if Set.isEmpty m.selectedEdges then
                        presentFile m
                            |> GF.updateDefaultEdgeProperties updateLabelVisibility

                    else
                        presentFile m
                            |> GF.updateEdges m.selectedEdges updateLabelVisibility
            in
            m
                |> setPresent newFile
                    "Toggled the labels of some edges"

        InputEdgeLabel str ->
            let
                updateLabel v =
                    { v
                        | label =
                            if str == "" then
                                Nothing

                            else
                                Just str
                    }

                newFile =
                    if Set.isEmpty m.selectedEdges then
                        presentFile m
                            |> GF.updateDefaultEdgeProperties updateLabel

                    else
                        presentFile m
                            |> GF.updateEdges m.selectedEdges updateLabel
            in
            m
                |> setPresent newFile
                    "Changed the label of some edges"

        InputEdgeColor newColor ->
            let
                updateColor e =
                    { e | color = newColor }

                newFile =
                    if Set.isEmpty m.selectedEdges then
                        presentFile m
                            |> GF.updateDefaultEdgeProperties updateColor

                    else
                        presentFile m
                            |> GF.updateEdges m.selectedEdges updateColor
            in
            m
                |> setPresent newFile
                    "Changed the color of some vertices"

        InputEdgeThickness num ->
            let
                updateThickness e =
                    { e | thickness = num }

                newFile =
                    if Set.isEmpty m.selectedEdges then
                        presentFile m
                            |> GF.updateDefaultEdgeProperties updateThickness

                    else
                        presentFile m
                            |> GF.updateEdges m.selectedEdges updateThickness
            in
            m
                |> setPresent newFile
                    "Changed the thickness of some edges"

        InputEdgeDistance num ->
            let
                updateDistance e =
                    { e | distance = num }

                newFile =
                    if Set.isEmpty m.selectedEdges then
                        presentFile m
                            |> GF.updateDefaultEdgeProperties updateDistance

                    else
                        presentFile m
                            |> GF.updateEdges m.selectedEdges updateDistance
            in
            m
                |> reheatSimulation
                |> setPresent newFile
                    "Changed the distance of some edges"

        InputEdgeStrength num ->
            let
                updateStrength e =
                    { e | strength = num }

                newFile =
                    if Set.isEmpty m.selectedEdges then
                        presentFile m
                            |> GF.updateDefaultEdgeProperties updateStrength

                    else
                        presentFile m
                            |> GF.updateEdges m.selectedEdges updateStrength
            in
            m
                |> reheatSimulation
                |> setPresent newFile
                    "Changed the strength of some edges "

        ToggleTableOfVertices ->
            { m | tableOfVerticesIsOn = not m.tableOfVerticesIsOn }

        ToggleTableOfEdges ->
            { m | tableOfEdgesIsOn = not m.tableOfEdgesIsOn }

        ToggleHistory ->
            { m | historyIsOn = not m.historyIsOn }

        ToggleSelector ->
            { m | selectorIsOn = not m.selectorIsOn }

        ToggleBags ->
            { m | bagsIsOn = not m.bagsIsOn }

        ToggleVertexPreferences ->
            { m | vertexPreferencesIsOn = not m.vertexPreferencesIsOn }

        ToggleEdgePreferences ->
            { m | edgePreferencesIsOn = not m.edgePreferencesIsOn }

        ClickOnVertexTrash ->
            let
                newFile =
                    presentFile m |> GF.removeVertices m.selectedVertices
            in
            { m
                | selectedVertices = Set.empty
                , highlightedVertices = Set.empty
                , selectedEdges = Set.empty
                , highlightedEdges = Set.empty
            }
                |> reheatSimulation
                |> setPresent newFile
                    ("Removed vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                    )

        ClickOnBagPlus ->
            let
                ( newFile, idOfTheNewBag ) =
                    presentFile m |> GF.addBag m.selectedVertices
            in
            { m
                | maybeSelectedBag = Just idOfTheNewBag
                , bagsIsOn = True
            }
                |> setPresent newFile
                    ("Added bag " ++ bagIdToString idOfTheNewBag)

        ClickOnBagTrash ->
            case m.maybeSelectedBag of
                Just bagId ->
                    let
                        newFile =
                            presentFile m |> GF.removeBag bagId
                    in
                    { m | maybeSelectedBag = Nothing }
                        |> reheatSimulation
                        |> setPresent newFile
                            ("Removed bag " ++ bagIdToString bagId)

                Nothing ->
                    m

        ClickOnEdgeTrash ->
            let
                newFile =
                    presentFile m |> GF.removeEdges m.selectedEdges
            in
            { m
                | highlightedEdges = Set.empty
                , selectedEdges = Set.empty
            }
                |> reheatSimulation
                |> setPresent newFile
                    ("Removed edges "
                        ++ edgeIdsToString (Set.toList m.selectedEdges)
                    )

        ClickOnEdgeContract ->
            case Set.toList m.selectedEdges of
                [ selectedEdge ] ->
                    let
                        newFile =
                            presentFile m |> GF.contractEdge selectedEdge
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedEdges = Set.empty
                    }
                        |> reheatSimulation
                        |> setPresent newFile
                            ("Contracted edge" ++ edgeIdToString selectedEdge)

                _ ->
                    m

        MouseOverVertexItem id ->
            { m | highlightedVertices = Set.singleton id }

        MouseOutVertexItem _ ->
            { m | highlightedVertices = Set.empty }

        ClickOnVertexItem id ->
            { m
                | selectedTool = Select SelectIdle
                , selectedVertices = Set.singleton id
                , selectedEdges = Set.empty
            }

        MouseOverEdgeItem edgeId ->
            { m | highlightedEdges = Set.singleton edgeId }

        MouseOutEdgeItem _ ->
            { m | highlightedEdges = Set.empty }

        ClickOnEdgeItem ( sourceId, targetId ) ->
            { m
                | selectedTool = Select SelectIdle
                , selectedVertices = Set.fromList [ sourceId, targetId ]
                , selectedEdges = Set.singleton ( sourceId, targetId )
            }

        MouseOverBagItem bagId ->
            { m | highlightedVertices = presentFile m |> GF.getVerticesInBag bagId }

        MouseOutBagItem _ ->
            { m | highlightedVertices = Set.empty }

        ClickOnBagItem bagId ->
            let
                ( newMaybeSelectedBag, newSelectedVertices ) =
                    if m.maybeSelectedBag == Just bagId then
                        ( Nothing
                        , Set.empty
                        )

                    else
                        ( Just bagId
                        , presentFile m |> GF.getVerticesInBag bagId
                        )
            in
            { m
                | maybeSelectedBag = newMaybeSelectedBag
                , selectedVertices = newSelectedVertices
                , selectedEdges = Set.empty
            }

        ClickOnGenerateStarGraphButton ->
            let
                newFile =
                    presentFile m
                        |> GF.addStarGraph { numberOfLeaves = 20 }
            in
            m
                |> setPresent newFile
                    "Added a generated graph "

        ClickOnNewFile ->
            { m
                | files =
                    Files.new "graph"
                        ( "Started with empty graph", GF.default )
                        m.files
            }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions m =
    Sub.batch
        [ Browser.Events.onResize (\w h -> WindowResize { width = w, height = h })
        , Browser.Events.onMouseMove (Decode.map MouseMove mousePosition)
        , Browser.Events.onMouseMove (Decode.map MouseMoveForUpdatingSvgPos mousePosition)
        , Browser.Events.onMouseUp (Decode.map MouseUp mousePosition)
        , Browser.Events.onKeyUp (Decode.map toKeyUpMsg keyDecoder)
        , Browser.Events.onVisibilityChange PageVisibility
        , if m.focusIsOnSomeTextInput then
            Sub.none

          else
            Browser.Events.onKeyDown (Decode.map toKeyDownMsg keyDecoder)
        , if Force.isCompleted m.simulationState || not m.vaderIsOn then
            Sub.none

          else
            Browser.Events.onAnimationFrame Tick
        ]


toKeyDownMsg : Key -> Msg
toKeyDownMsg key =
    case key of
        Character 'a' ->
            ClickOnDistractionFreeButton

        Character 'h' ->
            ClickOnHandTool

        Character 's' ->
            ClickOnSelectTool

        Character 'd' ->
            ClickOnDrawTool

        Character 'f' ->
            ClickOnVader

        Character 'g' ->
            ClickOnGravityTool

        Control "Alt" ->
            KeyDownAlt

        Control "Shift" ->
            KeyDownShift

        _ ->
            NoOp


toKeyUpMsg : Key -> Msg
toKeyUpMsg key =
    case key of
        Control "Alt" ->
            KeyUpAlt

        Control "Shift" ->
            KeyUpShift

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


layoutParams =
    { leftStripeWidth = 54
    , leftBarWidth = 260
    , rightBarWidth = 260
    , topBarHeight = 54
    }


edgeIdToString : EdgeId -> String
edgeIdToString ( from, to ) =
    String.fromInt from ++ " → " ++ String.fromInt to


vertexIdToString : VertexId -> String
vertexIdToString =
    String.fromInt


bagIdToString : BagId -> String
bagIdToString =
    String.fromInt


vertexIdsToString : List VertexId -> String
vertexIdsToString vs =
    let
        inside =
            vs
                |> List.map (\vertexId -> vertexIdToString vertexId ++ ", ")
                |> String.concat
                |> String.dropRight 2
    in
    "{ " ++ inside ++ " }"


edgeIdsToString : List EdgeId -> String
edgeIdsToString es =
    let
        inside =
            es
                |> List.map (\edgeId -> edgeIdToString edgeId ++ ", ")
                |> String.concat
                |> String.dropRight 2
    in
    "{ " ++ inside ++ " }"


view : Model -> Html Msg
view m =
    El.layoutWith
        { options =
            [ El.focusStyle
                { borderColor = Nothing
                , backgroundColor = Nothing
                , shadow = Nothing
                }
            ]
        }
        [ Font.color Colors.lightText
        , Font.size 10
        , Font.regular
        , El.htmlAttribute (HA.style "-webkit-font-smoothing" "antialiased")
        , El.height El.fill
        , El.width El.fill
        , El.htmlAttribute (HA.style "pointer-events" "none")
        ]
    <|
        El.row
            [ El.width El.fill
            , El.height El.fill
            ]
            (guiColumns m)


guiColumns m =
    let
        onlyYinYangInsteadOfLeftStripe =
            El.el
                [ El.width (El.px layoutParams.leftStripeWidth)
                , El.alignTop
                , El.padding 7
                , Events.onClick ClickOnDistractionFreeButton
                , El.pointer
                , El.htmlAttribute
                    (HA.title "Deactivate Distraction Free Mode (A)")
                , El.htmlAttribute (HA.style "pointer-events" "auto")
                ]
                (El.html
                    (Icons.draw40pxWithColor Colors.white
                        Icons.icons.yinAndYang
                    )
                )

        midCol =
            El.column
                [ El.height El.fill
                , El.width El.fill
                ]
                [ El.el
                    [ El.width El.fill
                    , El.alignTop
                    , El.htmlAttribute (HA.style "pointer-events" "auto")
                    ]
                    (topBar m)
                , El.el [ El.alignBottom, El.width El.fill ]
                    (fpsView m)
                ]
    in
    if m.distractionFree then
        [ onlyYinYangInsteadOfLeftStripe
        , midCol
        ]

    else
        [ leftStripe m
        , leftBar m
        , midCol
        , rightBar m
        ]


fpsView : Model -> Element Msg
fpsView m =
    let
        fps =
            case ( m.timeList, List.reverse m.timeList ) of
                ( newest :: _, oldest :: _ ) ->
                    let
                        delta =
                            max 1
                                (Time.posixToMillis newest
                                    - Time.posixToMillis oldest
                                )

                        averageFrameDuration =
                            toFloat delta / toFloat (List.length m.timeList)
                    in
                    1000 / averageFrameDuration

                _ ->
                    0

        scale =
            2
    in
    El.row
        [ El.padding 10
        , El.spacing 4
        ]
        [ El.el [ El.width (El.px 40), Font.alignRight ] <|
            El.text (String.fromInt (round fps))
        , El.text "fps "
        , El.html <|
            S.svg
                [ SA.height "10"
                , SA.width (String.fromFloat (scale * 70))
                ]
                [ S.rect
                    [ SA.height "10"
                    , SA.width (String.fromFloat (scale * fps))
                    , SA.fill (Colors.toString Colors.icon)
                    ]
                    []
                , S.rect
                    [ SA.height "10"
                    , SA.width (String.fromFloat (scale * 60))
                    , SA.fill "none"
                    , SA.stroke (Colors.toString Colors.white)
                    ]
                    []
                ]
        ]


leftStripe : Model -> Element Msg
leftStripe m =
    let
        distractionFreeButton =
            El.el
                [ El.width (El.px layoutParams.leftStripeWidth |> El.minimum layoutParams.leftStripeWidth)
                , El.padding 7
                , Events.onClick ClickOnDistractionFreeButton
                , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
                , Border.color Colors.menuBorder
                , El.pointer
                , El.htmlAttribute (HA.title "Activate Distraction Free Mode (A)")
                ]
            <|
                El.html
                    (Icons.draw40pxWithColor Colors.leftStripeIconSelected
                        Icons.icons.yinAndYang
                    )

        modeButton title selectedMode iconPath =
            let
                color =
                    if selectedMode == m.selectedMode then
                        Colors.white

                    else
                        Colors.leftStripeIconSelected
            in
            El.el
                [ El.htmlAttribute (HA.title title)
                , Events.onClick (ClickOnLeftMostBarRadioButton selectedMode)
                , El.pointer
                , El.padding 7
                ]
                (El.html (Icons.draw40pxWithColor color iconPath))

        radioButtonsForMode =
            El.column
                [ El.alignTop
                ]
                [ modeButton "Files" Files Icons.icons.trash
                , modeButton "Lists of Bags, Vertices and Edges" ListsOfBagsVerticesAndEdges Icons.icons.listOfThree
                , modeButton "Graph Operations" GraphOperations Icons.icons.magicStick
                , modeButton "Graph Queries" GraphQueries Icons.icons.qForQuery
                , modeButton "Graph Generators" GraphGenerators Icons.icons.lightning
                , modeButton "Algorithm Visualizations" AlgorithmVisualizations Icons.icons.algoVizPlay
                , modeButton "Games on Graphs"
                    GamesOnGraphs
                    Icons.icons.chessHorse
                , modeButton "Preferences" Preferences Icons.icons.preferencesGear
                ]

        githubButton =
            El.newTabLink
                [ El.htmlAttribute (HA.title "Source Code")
                , El.alignBottom
                , El.pointer
                , El.padding 7
                ]
                { url = "https://github.com/erkal/kite"
                , label = El.html (Icons.draw40pxWithColor Colors.yellow Icons.icons.githubCat)
                }

        --donateButton =
        --    El.newTabLink
        --        [ El.htmlAttribute (HA.title "Donate")
        --        , El.alignBottom
        --        ]
        --        { url = "lalala"
        --        , label = El.html (Icons.draw40pxWithColor "orchid" Icons.icons.donateHeart)
        --        }
    in
    El.column
        [ Background.color Colors.black
        , El.width (El.px layoutParams.leftStripeWidth)
        , El.height El.fill
        , El.scrollbarY
        , El.htmlAttribute (HA.style "pointer-events" "auto")
        ]
        [ distractionFreeButton
        , radioButtonsForMode
        , githubButton

        --, donateButton
        ]



-- LEFT BAR


leftBar : Model -> Element Msg
leftBar m =
    El.el
        [ Background.color Colors.menuBackground
        , Border.widthEach { bottom = 0, left = 0, right = 1, top = 0 }
        , Border.color Colors.menuBorder
        , El.width (El.px layoutParams.leftBarWidth)
        , El.height El.fill
        , El.scrollbarY
        , El.htmlAttribute (HA.style "pointer-events" "auto")
        ]
    <|
        case m.selectedMode of
            Files ->
                leftBarContentForFiles m

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

            Preferences ->
                leftBarContentForPreferences m


menu :
    { headerText : String
    , isOn : Bool
    , headerButtons : List (Element Msg)
    , toggleMsg : Msg
    , contentItems : List (Element Msg)
    }
    -> Element Msg
menu { headerText, isOn, headerButtons, toggleMsg, contentItems } =
    let
        onOffButton =
            El.el
                [ El.paddingXY 6 0
                , El.pointer
                , Events.onClick toggleMsg
                ]
            <|
                El.html <|
                    if isOn then
                        Icons.draw14px Icons.icons.menuOff

                    else
                        Icons.draw14px Icons.icons.menuOn

        header =
            El.row
                [ Background.color Colors.leftBarHeader
                , El.width El.fill
                , El.padding 4
                , El.spacing 4
                , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
                , Border.color Colors.menuBorder
                , Font.bold
                ]
            <|
                (onOffButton :: El.text headerText :: headerButtons)

        content =
            if isOn then
                El.column
                    [ El.width El.fill
                    , El.paddingXY 0 4
                    , El.spacing 4
                    ]
                    contentItems

            else
                El.none
    in
    El.column [ El.width El.fill ]
        [ header, content ]


leftBarHeaderButton :
    { title : String
    , onClickMsg : Msg
    , iconPath : String
    }
    -> Element Msg
leftBarHeaderButton { title, onClickMsg, iconPath } =
    El.el
        [ El.htmlAttribute (HA.title title)
        , Events.onClick onClickMsg
        , El.alignRight
        , Border.rounded 2
        , El.mouseDown [ Background.color Colors.selectedItem ]
        , El.mouseOver [ Background.color Colors.mouseOveredItem ]
        , El.pointer
        ]
        (El.html (Icons.draw14px iconPath))


leftBarContentForPreferences : Model -> Element Msg
leftBarContentForPreferences m =
    menu
        { headerText = "Preferences (coming soon)"
        , isOn = True
        , headerButtons = []
        , toggleMsg = NoOp
        , contentItems = []
        }


pointToString : Point2d -> String
pointToString p =
    "("
        ++ String.fromInt (round (Point2d.xCoordinate p))
        ++ ", "
        ++ String.fromInt (round (Point2d.yCoordinate p))
        ++ ")"


columnHeader : String -> Element Msg
columnHeader headerText =
    El.el
        [ El.paddingXY 2 6
        , Border.widthEach { top = 0, right = 0, bottom = 1, left = 1 }
        , Border.color Colors.menuBorder
        , Font.medium
        , Font.center
        ]
        (El.text headerText)


commonCellProperties =
    [ El.padding 2
    , El.width El.fill
    , El.height (El.px 16)
    , Font.center
    , Border.widthEach { top = 0, right = 0, bottom = 1, left = 1 }
    , Border.color Colors.menuBorder
    ]


leftBarContentForFiles : Model -> Element Msg
leftBarContentForFiles m =
    let
        content =
            El.column [] (List.map El.text (Files.fileNames m.files))

        newFileButton =
            leftBarHeaderButton
                { title = "Delete"
                , onClickMsg = ClickOnNewFile
                , iconPath = Icons.icons.plus
                }
    in
    menu
        { headerText = "Files (coming soon)"
        , isOn = True
        , headerButtons = [ newFileButton ]
        , toggleMsg = NoOp
        , contentItems = [ content ]
        }


leftBarContentForListsOfBagsVerticesAndEdges : Model -> Element Msg
leftBarContentForListsOfBagsVerticesAndEdges m =
    let
        tableOfVertices =
            let
                cell id content =
                    El.el
                        (commonCellProperties
                            ++ [ Events.onMouseEnter (MouseOverVertexItem id)
                               , Events.onMouseLeave (MouseOutVertexItem id)
                               , Events.onClick (ClickOnVertexItem id)
                               ]
                        )
                        content
            in
            El.table
                [ El.width El.fill
                , El.height El.fill
                ]
                { data = GF.getVertices (presentFile m)
                , columns =
                    [ { header = columnHeader "id"
                      , width = El.px 20
                      , view =
                            \{ id } ->
                                cell id <|
                                    El.text (String.fromInt id)
                      }
                    , { header = columnHeader "Label"
                      , width = El.fill
                      , view =
                            \{ id, label } ->
                                cell id <|
                                    case label.label of
                                        Just l ->
                                            El.text l

                                        Nothing ->
                                            El.el
                                                [ El.alpha 0.2
                                                , El.width El.fill
                                                ]
                                                (El.text "no label")
                      }
                    , { header = columnHeader "Fix"
                      , width = El.px 20
                      , view =
                            \{ id, label } ->
                                cell id <|
                                    El.el [ El.centerX ] <|
                                        if label.fixed then
                                            El.html
                                                (Icons.draw10px Icons.icons.checkMark)

                                        else
                                            El.none
                      }
                    , { header = columnHeader "X"
                      , width = El.px 26
                      , view =
                            \{ id, label } ->
                                label.position
                                    |> Point2d.xCoordinate
                                    |> round
                                    |> String.fromInt
                                    |> El.text
                                    |> cell id
                      }
                    , { header = columnHeader "Y"
                      , width = El.px 26
                      , view =
                            \{ id, label } ->
                                label.position
                                    |> Point2d.yCoordinate
                                    |> round
                                    |> String.fromInt
                                    |> El.text
                                    |> cell id
                      }
                    , { header = columnHeader "Str"
                      , width = El.px 30
                      , view =
                            \{ id, label } ->
                                cell id <|
                                    El.text (String.fromFloat label.manyBodyStrength)
                      }
                    , { header = columnHeader "Col"
                      , width = El.px 20
                      , view =
                            \{ id, label } ->
                                cell id <|
                                    El.html <|
                                        S.svg
                                            [ SA.width "16"
                                            , SA.height "10"
                                            ]
                                            [ S.circle
                                                [ SA.r "5"
                                                , SA.cx "8"
                                                , SA.cy "5"
                                                , SA.fill (Colors.toString label.color)
                                                ]
                                                []
                                            ]
                      }
                    , { header = columnHeader "Rad"
                      , width = El.px 24
                      , view =
                            \{ id, label } ->
                                cell id <|
                                    El.text (String.fromFloat label.radius)
                      }
                    , { header = columnHeader " "
                      , width = El.px 8
                      , view =
                            \{ id } ->
                                cell id <|
                                    El.el
                                        [ El.width El.fill
                                        , El.height El.fill
                                        , Background.color <|
                                            if Set.member id m.highlightedVertices then
                                                Colors.highlightPink

                                            else
                                                Colors.menuBackground
                                        ]
                                        El.none
                      }
                    , { header = columnHeader " "
                      , width = El.px 8
                      , view =
                            \{ id } ->
                                cell id <|
                                    El.el
                                        [ El.width El.fill
                                        , El.height El.fill
                                        , Background.color <|
                                            if Set.member id m.selectedVertices then
                                                Colors.selectBlue

                                            else
                                                Colors.menuBackground
                                        ]
                                        El.none
                      }
                    ]
                }

        --
        tableOfEdges =
            let
                cell edgeId content =
                    El.el
                        (commonCellProperties
                            ++ [ Events.onMouseEnter (MouseOverEdgeItem edgeId)
                               , Events.onMouseLeave (MouseOutEdgeItem edgeId)
                               , Events.onClick (ClickOnEdgeItem edgeId)
                               ]
                        )
                        content
            in
            El.table
                [ El.width El.fill
                , El.height El.fill
                ]
                { data = GF.getEdges (presentFile m)
                , columns =
                    [ { header = columnHeader "edge id"
                      , width = El.px 50
                      , view =
                            \{ from, to } ->
                                cell ( from, to ) <|
                                    El.text (edgeIdToString ( from, to ))
                      }
                    , { header = columnHeader "Label"
                      , width = El.fill
                      , view =
                            \{ from, to, label } ->
                                cell ( from, to ) <|
                                    case label.label of
                                        Just l ->
                                            El.text l

                                        Nothing ->
                                            El.el
                                                [ El.alpha 0.2
                                                , El.width El.fill
                                                ]
                                                (El.text "no label")
                      }
                    , { header = columnHeader "Str"
                      , width = El.px 30
                      , view =
                            \{ from, to, label } ->
                                cell ( from, to ) <|
                                    El.text (String.fromFloat label.strength)
                      }
                    , { header = columnHeader "Dist"
                      , width = El.px 30
                      , view =
                            \{ from, to, label } ->
                                cell ( from, to ) <|
                                    El.text (String.fromFloat label.distance)
                      }
                    , { header = columnHeader "Thc"
                      , width = El.px 30
                      , view =
                            \{ from, to, label } ->
                                cell ( from, to ) <|
                                    El.text (String.fromFloat label.thickness)
                      }
                    , { header = columnHeader "Col"
                      , width = El.px 20
                      , view =
                            \{ from, to, label } ->
                                cell ( from, to ) <|
                                    El.html <|
                                        S.svg
                                            [ SA.width "16"
                                            , SA.height "10"
                                            ]
                                            [ S.circle
                                                [ SA.r "5"
                                                , SA.cx "8"
                                                , SA.cy "5"
                                                , SA.fill (Colors.toString label.color)
                                                ]
                                                []
                                            ]
                      }
                    , { header = columnHeader " "
                      , width = El.px 8
                      , view =
                            \{ from, to, label } ->
                                cell ( from, to ) <|
                                    El.el
                                        [ El.width El.fill
                                        , El.height El.fill
                                        , Background.color <|
                                            if Set.member ( from, to ) m.highlightedEdges then
                                                Colors.highlightPink

                                            else
                                                Colors.menuBackground
                                        ]
                                        El.none
                      }
                    , { header = columnHeader " "
                      , width = El.px 8
                      , view =
                            \{ from, to, label } ->
                                cell ( from, to ) <|
                                    El.el
                                        [ El.width El.fill
                                        , El.height El.fill
                                        , Background.color <|
                                            if Set.member ( from, to ) m.selectedEdges then
                                                Colors.selectBlue

                                            else
                                                Colors.menuBackground
                                        ]
                                        El.none
                      }
                    ]
                }
    in
    El.column [ El.width El.fill ]
        [ menu
            { headerText = "Vertices"
            , isOn = m.tableOfVerticesIsOn
            , headerButtons =
                [ leftBarHeaderButton
                    { title = "Remove Selected Vertices"
                    , onClickMsg = ClickOnVertexTrash
                    , iconPath = Icons.icons.trash
                    }
                ]
            , toggleMsg = ToggleTableOfVertices
            , contentItems = [ tableOfVertices ]
            }
        , menu
            { headerText = "Edges"
            , isOn = m.tableOfEdgesIsOn
            , headerButtons =
                [ leftBarHeaderButton
                    { title = "Remove Selected Edges"
                    , onClickMsg = ClickOnEdgeTrash
                    , iconPath = Icons.icons.trash
                    }
                ]
            , toggleMsg = ToggleTableOfEdges
            , contentItems = [ tableOfEdges ]
            }
        ]


leftBarContentForGraphOperations : Model -> Element Msg
leftBarContentForGraphOperations m =
    menu
        { headerText = "Graph Operations (coming soon)"
        , isOn = True
        , headerButtons = []
        , toggleMsg = NoOp
        , contentItems = []
        }


leftBarContentForGraphQueries : Model -> Element Msg
leftBarContentForGraphQueries m =
    menu
        { headerText = "Graph Queries (coming soon)"
        , isOn = True
        , headerButtons = []
        , toggleMsg = NoOp
        , contentItems = []
        }


leftBarContentForGraphGenerators : Model -> Element Msg
leftBarContentForGraphGenerators m =
    let
        generateButton : Msg -> Element Msg
        generateButton msg =
            El.el
                [ El.htmlAttribute (HA.title "Generate!")
                , El.alignRight
                , Border.rounded 4
                , El.mouseDown [ Background.color Colors.selectedItem ]
                , El.mouseOver [ Background.color Colors.mouseOveredItem ]
                , El.pointer
                , Events.onClick msg
                ]
                (El.html (Icons.draw14px Icons.icons.lightning))
    in
    El.column [ El.width El.fill ]
        [ menu
            { headerText = "Basic Graphs"
            , isOn = True
            , headerButtons = []
            , toggleMsg = NoOp
            , contentItems =
                [ El.row [ El.padding 10, El.spacing 5 ]
                    [ generateButton ClickOnGenerateStarGraphButton
                    , El.el
                        [ Font.bold ]
                        (El.text "Star Graph")
                    ]
                , textInput
                    { labelText = "Number of Leaves"
                    , labelWidth = 100
                    , inputWidth = 40
                    , text = "TODO"
                    , onChange = always NoOp
                    }
                ]
            }
        , menu
            { headerText = "Random Graphs (coming soon)"
            , isOn = False
            , headerButtons = []
            , toggleMsg = NoOp
            , contentItems = []
            }
        ]


leftBarContentForAlgorithmVisualizations : Model -> Element Msg
leftBarContentForAlgorithmVisualizations m =
    menu
        { headerText = "Algorithm Visualizations (coming soon)"
        , isOn = True
        , headerButtons = []
        , toggleMsg = NoOp
        , contentItems = []
        }


leftBarContentForGamesOnGraphs : Model -> Element Msg
leftBarContentForGamesOnGraphs m =
    menu
        { headerText = "Games on Graphs (coming soon)"
        , isOn = True
        , headerButtons = []
        , toggleMsg = NoOp
        , contentItems = []
        }



-- TOP BAR


oneClickButtonGroup : List (Element Msg) -> Element Msg
oneClickButtonGroup buttonList =
    El.row
        [ El.spacing 4
        , El.padding 4
        ]
        buttonList


oneClickButton :
    { title : String
    , iconPath : String
    , onClickMsg : Msg
    , disabled : Bool
    }
    -> Element Msg
oneClickButton { title, iconPath, onClickMsg, disabled } =
    let
        commonAttributes =
            [ Background.color Colors.menuBackground
            , Border.width 1
            , Border.color Colors.menuBackground
            ]

        occasionalAttributes =
            if disabled then
                [ El.alpha 0.1
                , El.htmlAttribute (HA.title (title ++ " (disabled)"))
                ]

            else
                [ Border.rounded 2
                , El.htmlAttribute (HA.title title)
                , El.pointer
                , El.mouseDown [ Background.color Colors.black ]
                , El.mouseOver [ Border.color Colors.menuBorderOnMouseOver ]
                , Events.onClick onClickMsg
                ]
    in
    El.el (commonAttributes ++ occasionalAttributes)
        (El.html (Icons.draw34px iconPath))


radioButtonGroup : List (Element Msg) -> Element Msg
radioButtonGroup buttonList =
    El.row
        [ Border.width 1
        , Border.color Colors.menuBackground
        , Border.rounded 21
        , Background.color Colors.menuBackground
        , El.padding 4
        , El.spacing 4
        , El.mouseOver [ Border.color Colors.menuBorderOnMouseOver ]
        ]
        buttonList


radioButton :
    { title : String
    , iconPath : String
    , onClickMsg : Msg
    , state : {- Nothing for disabled -} Maybe Bool
    }
    -> Element Msg
radioButton { title, iconPath, onClickMsg, state } =
    let
        attributes =
            case state of
                Nothing ->
                    [ Border.rounded 20
                    , El.alpha 0.1
                    ]

                Just b ->
                    [ Border.rounded 20
                    , El.pointer
                    , Background.color <|
                        if b then
                            Colors.selectedItem

                        else
                            Colors.menuBackground
                    , El.mouseDown [ Background.color Colors.black ]
                    , El.htmlAttribute (HA.title title)
                    , Events.onClick onClickMsg
                    ]
    in
    El.el attributes (El.html (Icons.draw34px iconPath))


topBar : Model -> Element Msg
topBar m =
    El.el
        [ El.clip
        , Border.color Colors.menuBorder
        , El.centerX
        , El.height (El.px layoutParams.topBarHeight)
        ]
    <|
        El.row
            [ El.centerX
            , El.centerY
            , El.paddingXY 16 0
            , El.spacing 16
            ]
            [ oneClickButtonGroup
                [ oneClickButton
                    { title = "Undo"
                    , iconPath = Icons.icons.undo
                    , onClickMsg = ClickOnUndoButton
                    , disabled = not (m.files |> Files.focusedHasPast)
                    }
                , oneClickButton
                    { title = "Redo"
                    , iconPath = Icons.icons.redo
                    , onClickMsg = ClickOnRedoButton
                    , disabled = not (m.files |> Files.focusedHasFuture)
                    }
                ]
            , oneClickButtonGroup
                [ oneClickButton
                    { title = "Reset Zoom and Pan"
                    , iconPath = Icons.icons.resetZoomAndPan
                    , onClickMsg = ClickOnResetZoomAndPanButton
                    , disabled = False
                    }
                ]
            , radioButtonGroup
                [ radioButton
                    { title = "Hand (H)"
                    , iconPath = Icons.icons.hand
                    , onClickMsg = ClickOnHandTool
                    , state =
                        Just <|
                            case m.selectedTool of
                                Hand _ ->
                                    True

                                _ ->
                                    False
                    }
                , radioButton
                    { title = "Selection (S)"
                    , iconPath = Icons.icons.pointer
                    , onClickMsg = ClickOnSelectTool
                    , state =
                        Just <|
                            case m.selectedTool of
                                Select _ ->
                                    True

                                _ ->
                                    False
                    }
                , radioButton
                    { title = "Draw (D)"
                    , iconPath = Icons.icons.pen
                    , onClickMsg = ClickOnDrawTool
                    , state =
                        Just <|
                            case m.selectedTool of
                                Draw _ ->
                                    True

                                _ ->
                                    False
                    }
                , radioButton
                    { title = "Gravity (G)"
                    , iconPath = Icons.icons.gravityCenter
                    , onClickMsg = ClickOnGravityTool
                    , state =
                        Just <|
                            case m.selectedTool of
                                Gravity _ ->
                                    True

                                _ ->
                                    False
                    }
                ]
            , radioButtonGroup
                [ radioButton
                    { title = "Force (F)"
                    , iconPath = Icons.icons.vader
                    , onClickMsg = ClickOnVader
                    , state = Just m.vaderIsOn
                    }
                ]
            ]



-- RIGHT BAR


rightBar : Model -> Element Msg
rightBar m =
    El.column
        [ Background.color Colors.menuBackground
        , Border.widthEach { bottom = 0, left = 1, right = 0, top = 0 }
        , Border.color Colors.menuBorder
        , El.width (El.px layoutParams.rightBarWidth)
        , El.height El.fill
        , El.scrollbarY
        , El.htmlAttribute (HA.style "pointer-events" "auto")
        ]
        [ history m
        , selector m
        , bags m
        , vertexPreferences m
        , edgePreferences m
        ]


labelAttr labelWidth =
    [ El.centerY
    , El.width (El.px labelWidth)
    , Font.alignRight
    ]


textInput :
    { labelText : String
    , labelWidth : Int
    , inputWidth : Int
    , text : String
    , onChange : String -> Msg
    }
    -> Element Msg
textInput { labelText, labelWidth, inputWidth, text, onChange } =
    Input.text
        [ El.width (El.px inputWidth)
        , El.height (El.px 10)
        , Background.color Colors.inputBackground
        , El.paddingXY 6 10
        , El.spacing 8
        , Border.width 0
        , Border.rounded 2
        , El.focused
            [ Font.color Colors.darkText
            , Background.color Colors.white
            ]
        , Events.onFocus FocusedATextInput
        , Events.onLoseFocus FocusLostFromTextInput
        ]
        { onChange = onChange
        , text = text
        , placeholder = Nothing
        , label = Input.labelLeft (labelAttr labelWidth) (El.text labelText)
        }


sliderInput :
    { labelText : String
    , labelWidth : Int
    , value : Float
    , min : Float
    , max : Float
    , step : Float
    , onChange : Float -> Msg
    }
    -> Element Msg
sliderInput { labelText, labelWidth, value, min, max, step, onChange } =
    El.el [ El.width (El.px 240) ] <|
        Input.slider
            [ El.spacing 8
            , El.behindContent
                (El.el
                    [ El.width El.fill
                    , El.height (El.px 2)
                    , El.centerY
                    , Background.color Colors.inputBackground
                    , Border.rounded 2
                    ]
                    El.none
                )
            ]
            { onChange = onChange
            , label = Input.labelLeft (labelAttr labelWidth) (El.text labelText)
            , min = min
            , max = max
            , step = Just step
            , value = value
            , thumb =
                Input.thumb
                    [ El.width (El.px 4)
                    , El.height (El.px 10)
                    , Border.rounded 2
                    , Border.width 0
                    , Border.color Colors.sliderThumb
                    , Background.color Colors.icon
                    ]
            }


checkbox :
    { labelText : String
    , labelWidth : Int
    , state : Maybe Bool
    , onChange : Bool -> Msg
    }
    -> Element Msg
checkbox { labelText, labelWidth, state, onChange } =
    let
        ( icon, b ) =
            case state of
                Just True ->
                    ( El.html (Icons.draw14px Icons.icons.checkMark)
                    , False
                    )

                Just False ->
                    ( El.none
                    , True
                    )

                Nothing ->
                    ( El.html (Icons.draw14px Icons.icons.questionMark)
                    , True
                    )
    in
    El.row
        [ El.spacing 8
        ]
        [ El.el (labelAttr labelWidth) (El.text labelText)
        , El.el
            [ El.width (El.px 18)
            , El.height (El.px 18)
            , Border.rounded 2
            , Background.color Colors.inputBackground
            , El.pointer
            , Events.onClick (onChange b)
            ]
            (El.el [ El.centerX, El.centerY ] icon)
        ]


colorPicker :
    { labelText : String
    , labelWidth : Int
    , isExpanded : Bool
    , selectedColor : Maybe Color
    , msgOnExpanderClick : Msg
    , msgOnColorClick : Color -> Msg
    , msgOnLeave : Msg
    }
    -> Element Msg
colorPicker { labelText, labelWidth, isExpanded, selectedColor, msgOnExpanderClick, msgOnColorClick, msgOnLeave } =
    let
        input =
            El.el
                [ El.width (El.px 18)
                , El.height (El.px 18)
                , El.pointer
                , Border.rounded <|
                    if isExpanded then
                        0

                    else
                        2
                , Background.color <|
                    if isExpanded then
                        Colors.white

                    else
                        Colors.inputBackground
                , Events.onClick msgOnExpanderClick
                , Events.onMouseLeave msgOnLeave
                , El.below colorPalette
                ]
            <|
                case selectedColor of
                    Just c ->
                        El.el
                            [ El.width (El.px 10)
                            , El.height (El.px 10)
                            , El.centerX
                            , El.centerY
                            , Background.color c
                            ]
                            El.none

                    Nothing ->
                        El.el [ El.centerX, El.centerY ] <|
                            El.html (Icons.draw14px Icons.icons.questionMark)

        colorPalette =
            if isExpanded then
                El.wrappedRow
                    [ El.padding 4
                    , El.spacing 4
                    , El.width (El.px 84)
                    , Background.color Colors.white
                    ]
                <|
                    List.map makeColorBox Colors.vertexAndEdgeColors

            else
                El.none

        makeColorBox color =
            El.el
                [ El.width (El.px 16)
                , El.height (El.px 16)
                , Background.color color
                , Events.onClick (msgOnColorClick color)
                , El.pointer
                ]
                El.none
    in
    El.row [ El.spacing 8 ]
        [ El.el (labelAttr labelWidth) (El.text labelText)
        , input
        ]


history : Model -> Element Msg
history m =
    let
        commonAttributes i =
            [ Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
            , Border.color Colors.menuBorder
            , El.width El.fill
            , El.paddingXY 10 4
            , Events.onClick (ClickOnHistoryItem i)
            , El.pointer
            ]

        attributes i =
            if i <= Files.lengthPast m.files then
                commonAttributes i

            else
                El.alpha 0.3 :: commonAttributes i

        item i ( descriptionText, _ ) =
            El.el (attributes i) (El.text descriptionText)

        itemList =
            m.files
                |> Files.uLToList
                |> List.indexedMap item
                |> List.reverse

        content =
            El.column
                [ El.width El.fill
                , El.height (El.px 105)
                , El.scrollbarY
                ]
                itemList
    in
    menu
        { headerText = "History"
        , isOn = m.historyIsOn
        , headerButtons = []
        , toggleMsg = ToggleHistory
        , contentItems = [ content ]
        }


selector : Model -> Element Msg
selector m =
    let
        rectSelector =
            El.el
                [ El.htmlAttribute (HA.title "Rectangle Selector")
                , Background.color <|
                    case m.selectedSelector of
                        RectSelector ->
                            Colors.selectedItem

                        _ ->
                            Colors.menuBackground
                , Events.onClick ClickOnRectSelector
                , El.pointer
                , Border.rounded 12
                , El.mouseDown [ Background.color Colors.black ]
                ]
                (El.html (Icons.draw24px Icons.icons.selectionRect))

        lineSelector =
            El.el
                [ El.htmlAttribute (HA.title "Line Selector")
                , Background.color <|
                    case m.selectedSelector of
                        LineSelector ->
                            Colors.selectedItem

                        _ ->
                            Colors.menuBackground
                , Events.onClick ClickOnLineSelector
                , El.pointer
                , Border.rounded 12
                , El.mouseDown [ Background.color Colors.black ]
                ]
                (El.html (Icons.draw24px Icons.icons.selectionLine))

        content =
            El.row [ El.spacing 8 ]
                [ El.el
                    [ El.centerY
                    , El.width (El.px 60)
                    , Font.alignRight
                    ]
                    (El.text "Type")
                , El.row
                    [ El.spacing 3
                    , El.padding 3
                    , Border.rounded 16
                    , Border.width 1
                    , Border.color Colors.menuBorder
                    , El.mouseOver
                        [ Border.color Colors.menuBorderOnMouseOver ]
                    ]
                    [ rectSelector
                    , lineSelector
                    ]
                ]
    in
    menu
        { headerText = "Selector"
        , isOn = m.selectorIsOn
        , headerButtons = []
        , toggleMsg = ToggleSelector
        , contentItems = [ content ]
        }


bags : Model -> Element Msg
bags m =
    let
        tableOfBags =
            let
                cell bagId content =
                    El.el
                        (commonCellProperties
                            ++ [ Events.onMouseEnter (MouseOverBagItem bagId)
                               , Events.onMouseLeave (MouseOutBagItem bagId)
                               , Events.onClick (ClickOnBagItem bagId)
                               , El.scrollbarX
                               , Background.color <|
                                    if Just bagId == m.maybeSelectedBag then
                                        Colors.selectedItem

                                    else
                                        Colors.menuBackground
                               ]
                        )
                        content
            in
            El.table
                [ El.width El.fill
                , El.height (El.px 110)
                , El.scrollbarY
                , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
                , Border.color Colors.menuBorder
                ]
                { data = GF.getBags (presentFile m)
                , columns =
                    [ { header = columnHeader "id"
                      , width = El.px 20
                      , view =
                            \{ bagId } ->
                                cell bagId <|
                                    El.text (String.fromInt bagId)
                      }
                    , { header = columnHeader "Label"
                      , width = El.fill
                      , view =
                            \{ bagId, bagProperties } ->
                                cell bagId <|
                                    case bagProperties.label of
                                        Just l ->
                                            El.text l

                                        Nothing ->
                                            El.el
                                                [ El.alpha 0.2
                                                , El.width El.fill
                                                ]
                                                (El.text "no label")
                      }
                    , { header = columnHeader "Elements"
                      , width = El.px 60
                      , view =
                            \{ bagId, bagProperties } ->
                                cell bagId <|
                                    El.text
                                        (presentFile m
                                            |> GF.getVerticesInBag bagId
                                            |> Set.toList
                                            |> vertexIdsToString
                                        )
                      }
                    , { header = columnHeader "CH"
                      , width = El.px 20
                      , view =
                            \{ bagId, bagProperties } ->
                                cell bagId <|
                                    El.el [ El.centerX ] <|
                                        if bagProperties.hasConvexHull then
                                            El.html (Icons.draw10px Icons.icons.checkMark)

                                        else
                                            El.none
                      }
                    , { header = columnHeader "Col"
                      , width = El.px 20
                      , view =
                            \{ bagId, bagProperties } ->
                                cell bagId <|
                                    El.html <|
                                        S.svg
                                            [ SA.width "16"
                                            , SA.height "10"
                                            ]
                                            [ S.circle
                                                [ SA.r "5"
                                                , SA.cx "8"
                                                , SA.cy "5"
                                                , SA.fill (Colors.toString bagProperties.color)
                                                ]
                                                []
                                            ]
                      }
                    ]
                }

        maybeBagPreferences =
            case m.maybeSelectedBag of
                Nothing ->
                    []

                Just idOfTheSelectedBag ->
                    [ El.row []
                        [ textInput
                            { labelText = "Label"
                            , labelWidth = 80
                            , inputWidth = 60
                            , text =
                                presentFile m
                                    |> GF.getBagProperties idOfTheSelectedBag
                                    |> Maybe.map .label
                                    |> Maybe.withDefault Nothing
                                    |> Maybe.withDefault ""
                            , onChange = InputBagLabel idOfTheSelectedBag
                            }
                        ]
                    , El.row [ El.height (El.px 40) ]
                        [ colorPicker
                            { labelText = "Color"
                            , labelWidth = 80
                            , isExpanded = m.bagColorPickerIsExpanded
                            , selectedColor =
                                presentFile m
                                    |> GF.getBagProperties idOfTheSelectedBag
                                    |> Maybe.map .color
                            , msgOnColorClick = InputBagColor idOfTheSelectedBag
                            , msgOnExpanderClick = ClickOnBagColorPicker
                            , msgOnLeave = MouseLeaveBagColorPicker
                            }
                        , checkbox
                            { labelText = "Convex Hull"
                            , labelWidth = 80
                            , state =
                                presentFile m
                                    |> GF.getBagProperties idOfTheSelectedBag
                                    |> Maybe.map .hasConvexHull
                            , onChange = InputBagConvexHull idOfTheSelectedBag
                            }
                        ]
                    ]
    in
    menu
        { headerText = "Bags"
        , isOn = m.bagsIsOn
        , headerButtons =
            [ leftBarHeaderButton
                { title = "Add New Bag"
                , onClickMsg = ClickOnBagPlus
                , iconPath = Icons.icons.plus
                }
            , leftBarHeaderButton
                { title = "Remove Selected Bag"
                , onClickMsg = ClickOnBagTrash
                , iconPath = Icons.icons.trash
                }
            ]
        , toggleMsg = ToggleBags
        , contentItems =
            [ tableOfBags
            , El.column [ El.height (El.px 50) ] maybeBagPreferences
            ]
        }


vertexPreferences : Model -> Element Msg
vertexPreferences m =
    let
        headerForVertexProperties =
            case Set.size m.selectedVertices of
                0 ->
                    "Vertex Preferences"

                1 ->
                    "Selected Vertex"

                _ ->
                    "Selected Vertices"
    in
    menu
        { headerText = headerForVertexProperties
        , isOn = m.vertexPreferencesIsOn
        , headerButtons = []
        , toggleMsg = ToggleVertexPreferences
        , contentItems =
            [ El.row []
                [ textInput
                    { labelText = "Label"
                    , labelWidth = 80
                    , inputWidth = 60
                    , text =
                        if Set.isEmpty m.selectedVertices then
                            presentFile m
                                |> GF.getDefaultVertexProperties
                                |> .label
                                |> Maybe.withDefault ""

                        else
                            case presentFile m |> GF.getCommonVertexProperty m.selectedVertices .label of
                                Just (Just l) ->
                                    l

                                _ ->
                                    ""
                    , onChange = InputVertexLabel
                    }
                , checkbox
                    { labelText = "Show Label"
                    , labelWidth = 70
                    , state =
                        if Set.isEmpty m.selectedVertices then
                            Just
                                (presentFile m
                                    |> GF.getDefaultVertexProperties
                                    |> .labelIsVisible
                                )

                        else
                            presentFile m
                                |> GF.getCommonVertexProperty m.selectedVertices .labelIsVisible
                    , onChange =
                        InputVertexLabelVisibility
                    }
                ]
            , El.row []
                [ checkbox
                    { labelText = "Fixed"
                    , labelWidth = 80
                    , state =
                        if Set.isEmpty m.selectedVertices then
                            Just
                                (presentFile m
                                    |> GF.getDefaultVertexProperties
                                    |> .fixed
                                )

                        else
                            presentFile m
                                |> GF.getCommonVertexProperty m.selectedVertices .fixed
                    , onChange = InputVertexFixed
                    }
                , textInput
                    { labelText = "X"
                    , labelWidth = 20
                    , inputWidth = 40
                    , text =
                        presentFile m
                            |> GF.getCentroid m.selectedVertices
                            |> Maybe.map Point2d.xCoordinate
                            |> Maybe.map round
                            |> Maybe.map String.fromInt
                            |> Maybe.withDefault "?"
                    , onChange = InputVertexX
                    }
                , textInput
                    { labelText = "Y"
                    , labelWidth = 20
                    , inputWidth = 40
                    , text =
                        presentFile m
                            |> GF.getCentroid m.selectedVertices
                            |> Maybe.map Point2d.yCoordinate
                            |> Maybe.map round
                            |> Maybe.map String.fromInt
                            |> Maybe.withDefault "?"
                    , onChange = InputVertexY
                    }
                ]
            , sliderInput
                { labelText = "Charge"
                , labelWidth = 80
                , value =
                    -1
                        * (let
                            defaultVertexManyBodyStrength =
                                presentFile m
                                    |> GF.getDefaultVertexProperties
                                    |> .manyBodyStrength
                           in
                           if Set.isEmpty m.selectedVertices then
                            defaultVertexManyBodyStrength

                           else
                            presentFile m
                                |> GF.getCommonVertexProperty m.selectedVertices .manyBodyStrength
                                |> Maybe.withDefault defaultVertexManyBodyStrength
                          )
                , min = 50
                , max = 2000
                , step = 50
                , onChange = InputVertexCharge
                }
            , sliderInput
                { labelText = "Radius"
                , labelWidth = 80
                , value =
                    if Set.isEmpty m.selectedVertices then
                        presentFile m
                            |> GF.getDefaultVertexProperties
                            |> .radius

                    else
                        case presentFile m |> GF.getCommonVertexProperty m.selectedVertices .radius of
                            Just r ->
                                r

                            Nothing ->
                                5
                , min = 4
                , max = 20
                , step = 1
                , onChange = InputVertexRadius
                }
            , colorPicker
                { labelText = "Color"
                , labelWidth = 80
                , isExpanded = m.vertexColorPickerIsExpanded
                , selectedColor =
                    if Set.isEmpty m.selectedVertices then
                        Just
                            (presentFile m
                                |> GF.getDefaultVertexProperties
                                |> .color
                            )

                    else
                        presentFile m
                            |> GF.getCommonVertexProperty m.selectedVertices .color
                , msgOnColorClick = InputVertexColor
                , msgOnExpanderClick = ClickOnVertexColorPicker
                , msgOnLeave = MouseLeaveVertexColorPicker
                }
            , sliderInput
                { labelText = "Gravity"
                , labelWidth = 80
                , value =
                    if Set.isEmpty m.selectedVertices then
                        presentFile m
                            |> GF.getDefaultVertexProperties
                            |> .gravityStrength

                    else
                        case presentFile m |> GF.getCommonVertexProperty m.selectedVertices .gravityStrength of
                            Just gS ->
                                gS

                            Nothing ->
                                0.1
                , min = 0
                , max = 1
                , step = 0.05
                , onChange = InputVertexGravityStrength
                }
            ]
        }


edgePreferences : Model -> Element Msg
edgePreferences m =
    let
        headerForEdgeProperties =
            case Set.size m.selectedEdges of
                0 ->
                    "Edge Preferences"

                1 ->
                    "Selected Edge"

                _ ->
                    "Selected Edges"
    in
    menu
        { headerText = headerForEdgeProperties
        , isOn = m.edgePreferencesIsOn
        , headerButtons = []
        , toggleMsg = ToggleEdgePreferences
        , contentItems =
            [ El.row []
                [ textInput
                    { labelText = "Label"
                    , labelWidth = 80
                    , inputWidth = 60
                    , text =
                        if Set.isEmpty m.selectedEdges then
                            presentFile m
                                |> GF.getDefaultEdgeProperties
                                |> .label
                                |> Maybe.withDefault ""

                        else
                            case presentFile m |> GF.getCommonEdgeProperty m.selectedEdges .label of
                                Just (Just l) ->
                                    l

                                _ ->
                                    ""
                    , onChange = InputEdgeLabel
                    }
                , checkbox
                    { labelText = "Show Label"
                    , labelWidth = 70
                    , state =
                        if Set.isEmpty m.selectedEdges then
                            Just
                                (presentFile m
                                    |> GF.getDefaultEdgeProperties
                                    |> .labelIsVisible
                                )

                        else
                            presentFile m
                                |> GF.getCommonEdgeProperty m.selectedEdges .labelIsVisible
                    , onChange =
                        InputEdgeLabelVisibility
                    }
                ]
            , sliderInput
                { labelText = "Thickness"
                , labelWidth = 80
                , value =
                    if Set.isEmpty m.selectedEdges then
                        presentFile
                            m
                            |> GF.getDefaultEdgeProperties
                            |> .thickness

                    else
                        presentFile
                            m
                            |> GF.getCommonEdgeProperty m.selectedEdges .thickness
                            |> Maybe.withDefault 3
                , min = 1
                , max = 20
                , step = 1
                , onChange = InputEdgeThickness
                }
            , sliderInput
                { labelText = "Distance"
                , labelWidth = 80
                , value =
                    if Set.isEmpty m.selectedEdges then
                        presentFile
                            m
                            |> GF.getDefaultEdgeProperties
                            |> .distance

                    else
                        presentFile
                            m
                            |> GF.getCommonEdgeProperty m.selectedEdges .distance
                            |> Maybe.withDefault 40
                , min = 10
                , max = 200
                , step = 10
                , onChange = InputEdgeDistance
                }
            , sliderInput
                { labelText = "Strength"
                , labelWidth = 80
                , value =
                    if Set.isEmpty m.selectedEdges then
                        presentFile m
                            |> GF.getDefaultEdgeProperties
                            |> .strength

                    else
                        presentFile m
                            |> GF.getCommonEdgeProperty m.selectedEdges .strength
                            |> Maybe.withDefault 0.7
                , min = 0
                , max = 1
                , step = 0.05
                , onChange = InputEdgeStrength
                }
            , colorPicker
                { labelText = "Color"
                , labelWidth = 80
                , isExpanded = m.edgeColorPickerIsExpanded
                , selectedColor =
                    if Set.isEmpty m.selectedEdges then
                        Just
                            (presentFile m
                                |> GF.getDefaultEdgeProperties
                                |> .color
                            )

                    else
                        presentFile m
                            |> GF.getCommonEdgeProperty m.selectedEdges .color
                , msgOnColorClick = InputEdgeColor
                , msgOnExpanderClick = ClickOnEdgeColorPicker
                , msgOnLeave = MouseLeaveEdgeColorPicker
                }
            ]
        }



--MAIN SVG


wheelDeltaY : Decoder Int
wheelDeltaY =
    Decode.field "deltaY" Decode.int


emptySvgElement =
    S.g [] []


mainSvg : Model -> Html Msg
mainSvg m =
    let
        a4HeightByWidth =
            297 / 210

        backgroundPageWidth =
            600

        pageA4WithRuler =
            S.g []
                [ S.rect
                    [ SA.x "0"
                    , SA.y "0"
                    , SA.width (String.fromFloat backgroundPageWidth)
                    , SA.height (String.fromFloat (backgroundPageWidth * a4HeightByWidth))
                    , SA.stroke (Colors.toString Colors.svgLine)
                    , SA.fill "none"
                    , SA.strokeWidth (String.fromFloat (1 / m.zoom))
                    ]
                    []
                , S.line
                    [ SA.x1 "100"
                    , SA.y1 "0"
                    , SA.x2 "100"
                    , SA.y2 (String.fromFloat (-5 / m.zoom))
                    , SA.stroke (Colors.toString Colors.svgLine)
                    , SA.strokeWidth (String.fromFloat (1 / m.zoom))
                    ]
                    []
                , S.text_
                    [ SA.x "100"
                    , SA.y (String.fromFloat (-24 / m.zoom))
                    , SA.fill (Colors.toString Colors.svgLine)
                    , SA.textAnchor "middle"
                    , SA.fontSize (String.fromFloat (12 / m.zoom))
                    ]
                    [ S.text <| String.fromInt (round (100 * m.zoom)) ++ "%" ]
                , S.text_
                    [ SA.x "100"
                    , SA.y (String.fromFloat (-10 / m.zoom))
                    , SA.fill (Colors.toString Colors.svgLine)
                    , SA.textAnchor "middle"
                    , SA.fontSize (String.fromFloat (12 / m.zoom))
                    ]
                    [ S.text <| "100px" ]
                ]

        transparentInteractionRect =
            S.rect
                [ SA.fillOpacity "0"
                , SA.x (String.fromFloat (Point2d.xCoordinate m.pan))
                , SA.y (String.fromFloat (Point2d.yCoordinate m.pan))
                , SA.width (String.fromFloat (toFloat m.windowSize.width / m.zoom))
                , SA.height (String.fromFloat (toFloat m.windowSize.height / m.zoom))
                , HE.onMouseDown MouseDownOnTransparentInteractionRect
                , HE.onMouseUp MouseUpOnTransparentInteractionRect
                ]
                []

        maybeBrushedEdge =
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    case presentFile m |> GF.getVertexProperties sourceId of
                        Just { position } ->
                            let
                                dEP =
                                    presentFile m |> GF.getDefaultEdgeProperties
                            in
                            Geometry.Svg.lineSegment2d
                                [ SA.strokeWidth (String.fromFloat dEP.thickness)
                                , SA.stroke (Colors.toString dEP.color)
                                ]
                                (LineSegment2d.from position m.svgMousePosition)

                        Nothing ->
                            emptySvgElement

                _ ->
                    emptySvgElement

        maybeBrushedSelector =
            case m.selectedTool of
                Select (BrushingForSelection { brushStart }) ->
                    case m.selectedSelector of
                        RectSelector ->
                            Geometry.Svg.boundingBox2d
                                [ SA.stroke (Colors.toString Colors.selectorStroke)
                                , SA.strokeWidth "1"
                                , SA.strokeDasharray "1 2"
                                , SA.fill "none"
                                ]
                                (BoundingBox2d.from brushStart m.svgMousePosition)

                        LineSelector ->
                            Geometry.Svg.lineSegment2d
                                [ SA.stroke (Colors.toString Colors.selectorStroke)
                                , SA.strokeWidth "1"
                                , SA.strokeDasharray "1 2"
                                ]
                                (LineSegment2d.from brushStart m.svgMousePosition)

                _ ->
                    emptySvgElement

        maybeRectAroundSelectedVertices =
            let
                rect selectedVertices =
                    let
                        maybeBoudingBox =
                            presentFile m
                                |> GF.getBoundingBoxWithMargin selectedVertices
                    in
                    case maybeBoudingBox of
                        Just bB ->
                            Geometry.Svg.boundingBox2d
                                [ SA.strokeWidth "1"
                                , SA.stroke (Colors.toString Colors.rectAroundSelectedVertices)
                                , SA.fill "none"
                                ]
                                bB

                        Nothing ->
                            emptySvgElement
            in
            case m.selectedTool of
                Select vertexSelectorState ->
                    case vertexSelectorState of
                        BrushingForSelection _ ->
                            emptySvgElement

                        _ ->
                            rect m.selectedVertices

                _ ->
                    emptySvgElement

        maybeHighlightsOnSelectedVertices =
            let
                drawHL { position, radius } =
                    Geometry.Svg.circle2d
                        [ SA.fill (Colors.toString Colors.selectBlue) ]
                        (position |> Circle2d.withRadius (radius + 4))
            in
            S.g []
                (presentFile m
                    |> GF.getVertices
                    |> List.filter (\{ id } -> Set.member id m.selectedVertices)
                    |> List.map (.label >> drawHL)
                )

        maybeHighlightOnMouseOveredVertices =
            let
                drawHL { position, radius } =
                    Geometry.Svg.circle2d
                        [ SA.fill (Colors.toString Colors.highlightPink) ]
                        (position |> Circle2d.withRadius (radius + 4))
            in
            S.g []
                (presentFile m
                    |> GF.getVertices
                    |> List.filter (\{ id } -> Set.member id m.highlightedVertices)
                    |> List.map (.label >> drawHL)
                )

        maybeHighlightsOnSelectedEdges =
            let
                drawHL { from, to, label } =
                    case
                        ( presentFile m |> GF.getVertexProperties from
                        , presentFile m |> GF.getVertexProperties to
                        )
                    of
                        ( Just v, Just w ) ->
                            Geometry.Svg.lineSegment2d
                                [ SA.stroke (Colors.toString Colors.selectBlue)
                                , SA.strokeWidth (String.fromFloat (label.thickness + 6))
                                ]
                                (LineSegment2d.from v.position w.position)

                        _ ->
                            -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE" <|
                            emptySvgElement
            in
            S.g []
                (presentFile m
                    |> GF.getEdges
                    |> List.filter (\{ from, to } -> Set.member ( from, to ) m.selectedEdges)
                    |> List.map drawHL
                )

        maybeHighlightOnMouseOveredEdges =
            let
                drawHL { from, to, label } =
                    case
                        ( presentFile m |> GF.getVertexProperties from
                        , presentFile m |> GF.getVertexProperties to
                        )
                    of
                        ( Just v, Just w ) ->
                            Geometry.Svg.lineSegment2d
                                [ SA.stroke (Colors.toString Colors.highlightPink)
                                , SA.strokeWidth (String.fromFloat (label.thickness + 6))
                                ]
                                (LineSegment2d.from v.position w.position)

                        _ ->
                            -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE" <|
                            emptySvgElement
            in
            S.g []
                (presentFile m
                    |> GF.getEdges
                    |> List.filter (\{ from, to } -> Set.member ( from, to ) m.highlightedEdges)
                    |> List.map drawHL
                )

        cursor =
            case m.selectedTool of
                Gravity _ ->
                    "crosshair"

                Hand HandIdle ->
                    "grab"

                Hand (Panning _) ->
                    "grabbing"

                Draw _ ->
                    "crosshair"

                Select _ ->
                    "default"

        mainSvgWidth =
            m.windowSize.width

        mainSvgHeight =
            m.windowSize.height

        svgViewBoxFromPanAndZoom pan zoom =
            [ Point2d.xCoordinate m.pan
            , Point2d.yCoordinate m.pan
            , toFloat mainSvgWidth / zoom
            , toFloat mainSvgHeight / zoom
            ]
                |> List.map String.fromFloat
                |> List.intersperse " "
                |> String.concat
    in
    S.svg
        [ HA.style "background-color" (Colors.toString Colors.mainSvgBackground)
        , HA.style "cursor" cursor
        , HA.style "position" "absolute"
        , SA.width (String.fromInt mainSvgWidth)
        , SA.height (String.fromInt mainSvgHeight)
        , SA.viewBox (svgViewBoxFromPanAndZoom m.pan m.zoom)
        , SE.onMouseDown MouseDownOnMainSvg
        , HE.on "wheel" (Decode.map WheelDeltaY wheelDeltaY)
        ]
        [ maybeViewGravityLines m
        , pageA4WithRuler
        , viewHulls (presentFile m)
        , maybeBrushedEdge
        , transparentInteractionRect
        , maybeHighlightsOnSelectedEdges
        , maybeHighlightOnMouseOveredEdges
        , maybeHighlightsOnSelectedVertices
        , maybeHighlightOnMouseOveredVertices
        , viewEdges (presentFile m)
        , viewVertices (presentFile m)
        , maybeBrushedSelector
        , maybeRectAroundSelectedVertices
        , maybeViewGravityCenters m
        ]



-- GRAPH VIEW


viewEdges : GraphFile -> Html Msg
viewEdges graphFile =
    let
        labelDistance =
            10

        labelPosition : LineSegment2d -> Point2d
        labelPosition edgeLine =
            let
                fromEdgeMidpointToLabelMidpoint =
                    edgeLine
                        |> LineSegment2d.perpendicularDirection
                        |> Maybe.withDefault Direction2d.negativeY
                        |> Direction2d.reverse
                        |> Direction2d.toVector
                        |> Vector2d.scaleBy labelDistance
            in
            edgeLine
                |> LineSegment2d.midpoint
                |> Point2d.translateBy fromEdgeMidpointToLabelMidpoint

        edgeWithKey { from, to, label } =
            case ( GF.getVertexProperties from graphFile, GF.getVertexProperties to graphFile ) of
                ( Just v, Just w ) ->
                    let
                        edgeLine =
                            LineSegment2d.from v.position w.position

                        lP =
                            labelPosition edgeLine

                        eL =
                            S.text_
                                [ SA.x (String.fromFloat (Point2d.xCoordinate lP))
                                , SA.y (String.fromFloat (Point2d.yCoordinate lP))
                                , SA.textAnchor "middle"
                                , SA.fill (Colors.toString Colors.lightText)
                                ]
                                [ S.text <|
                                    case label.label of
                                        Just l ->
                                            l

                                        Nothing ->
                                            ""
                                ]

                        edgeLabel =
                            if label.labelIsVisible then
                                eL

                            else
                                emptySvgElement
                    in
                    ( edgeIdToString ( from, to )
                    , S.g
                        [ SE.onMouseDown (MouseDownOnEdge ( from, to ))
                        , SE.onMouseUp (MouseUpOnEdge ( from, to ))
                        , SE.onMouseOver (MouseOverEdge ( from, to ))
                        , SE.onMouseOut (MouseOutEdge ( from, to ))
                        ]
                        [ Geometry.Svg.lineSegment2d
                            [ SA.stroke "red"
                            , SA.strokeOpacity "0"
                            , SA.strokeWidth (String.fromFloat (label.thickness + 6))
                            ]
                            edgeLine
                        , Geometry.Svg.lineSegment2d
                            [ SA.stroke (Colors.toString label.color)
                            , SA.strokeWidth (String.fromFloat label.thickness)
                            ]
                            edgeLine
                        , edgeLabel
                        ]
                    )

                _ ->
                    -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE" <|
                    ( "", emptySvgElement )
    in
    Svg.Keyed.node "g" [] (graphFile |> GF.getEdges |> List.map edgeWithKey)


viewVertices : GraphFile -> Html Msg
viewVertices graphFile =
    let
        pin fixed radius =
            if fixed then
                Geometry.Svg.circle2d
                    [ SA.fill "red"
                    , SA.stroke "white"
                    ]
                    (Point2d.origin |> Circle2d.withRadius (radius / 2))

            else
                emptySvgElement

        viewVertex { id, label } =
            let
                { position, color, radius, fixed } =
                    label

                ( x, y ) =
                    Point2d.coordinates position

                vertexLabel =
                    if label.labelIsVisible then
                        S.text_
                            [ SA.fill (Colors.toString Colors.lightText)
                            , SA.textAnchor "middle"
                            , SA.y "-10"
                            ]
                            [ S.text <|
                                case label.label of
                                    Just l ->
                                        l

                                    Nothing ->
                                        ""
                            ]

                    else
                        emptySvgElement
            in
            ( String.fromInt id
            , S.g
                [ SA.transform <| "translate(" ++ String.fromFloat x ++ "," ++ String.fromFloat y ++ ")"
                , SE.onMouseDown (MouseDownOnVertex id)
                , SE.onMouseUp (MouseUpOnVertex id)
                , SE.onMouseOver (MouseOverVertex id)
                , SE.onMouseOut (MouseOutVertex id)
                ]
                [ Geometry.Svg.circle2d [ SA.fill (Colors.toString color) ]
                    (Point2d.origin |> Circle2d.withRadius radius)
                , pin fixed radius
                , vertexLabel
                ]
            )
    in
    Svg.Keyed.node "g" [] (graphFile |> GF.getVertices |> List.map viewVertex)


maybeViewGravityLines : Model -> Html Msg
maybeViewGravityLines m =
    case m.selectedTool of
        Gravity _ ->
            let
                viewGravityLine { id, label } =
                    Geometry.Svg.lineSegment2d
                        [ SA.strokeWidth "2"
                        , SA.stroke (Colors.toString Colors.highlightPink)
                        , SA.strokeDasharray "2 4"
                        ]
                        (LineSegment2d.from label.position label.gravityCenter)
            in
            S.g [] (presentFile m |> GF.getVertices |> List.map viewGravityLine)

        _ ->
            emptySvgElement


viewHulls : GraphFile -> Html Msg
viewHulls graphFile =
    let
        hull : Color -> List Point2d -> Html a
        hull color positions =
            Geometry.Svg.polygon2d
                [ SA.fill (Colors.toString color)
                , SA.opacity "0.3"
                , SA.stroke (Colors.toString color)
                , SA.strokeWidth "50"
                , SA.strokeLinejoin "round"
                ]
                (Polygon2d.convexHull positions)

        hulls =
            GF.getBagsWithVertices graphFile
                |> Dict.values
                |> List.filter (\( bP, _ ) -> bP.hasConvexHull)
                |> List.map
                    (\( bP, l ) ->
                        hull bP.color
                            (l |> List.map (Tuple.second >> .position))
                    )
    in
    S.g [] hulls


maybeViewGravityCenters : Model -> Html Msg
maybeViewGravityCenters m =
    let
        viewGC ( coordinates, idList ) =
            Geometry.Svg.circle2d
                [ SA.fill (Colors.toString Colors.highlightPink)
                , SE.onMouseDown (MouseDownOnGravityCenter idList)
                ]
                (Point2d.fromCoordinates coordinates |> Circle2d.withRadius 10)

        viewDefaultGC =
            Geometry.Svg.circle2d
                [ SA.fill (Colors.toString Colors.highlightPink)
                , SA.opacity "0.2"
                , SE.onMouseDown MouseDownOnDefaultGravityCenter
                ]
                (.gravityCenter (GF.getDefaultVertexProperties (presentFile m)) |> Circle2d.withRadius 10)
    in
    case m.selectedTool of
        Gravity _ ->
            S.g [] <|
                viewDefaultGC
                    :: (GF.pullCentersWithVertices (presentFile m) |> Dict.toList |> List.map viewGC)

        _ ->
            emptySvgElement
