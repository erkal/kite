port module Main exposing (main)

import Algorithms.Dijkstra.API
import Algorithms.TopologicalSorting.API
import BoundingBox2d exposing (BoundingBox2d)
import Browser exposing (Document)
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
import Generators.ElmDep as ElmDep
import Geometry.Svg
import Graph.Force as Force exposing (Force)
import GraphFile as GF exposing (BagId, BagProperties, EdgeId, EdgeProperties, GraphFile, LabelPosition(..), VertexId, VertexProperties)
import Html as H exposing (Html, div)
import Html.Attributes as HA
import Html.Events as HE
import Http
import Icons exposing (icons)
import IntDict exposing (IntDict)
import Json.Decode as JD exposing (Decoder, Value)
import Json.Encode as JE
import LineSegment2d exposing (LineSegment2d)
import Point2d exposing (Point2d)
import Polygon2d exposing (Polygon2d)
import Set exposing (Set)
import Svg as S exposing (Svg)
import Svg.Attributes as SA
import Svg.Events as SE
import Svg.Keyed
import Task
import Time
import Transition
import Triangle2d exposing (Triangle2d)
import Vector2d exposing (Vector2d)


main : Program (Maybe Value) Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


port setStorage : String -> Cmd msg


init : Maybe Value -> ( Model, Cmd Msg )
init maybeValue =
    ( case maybeValue of
        Just value ->
            initialModel
                (Result.toMaybe (JD.decodeValue graphFilesDecoder value))

        Nothing ->
            initialModel Nothing
    , Task.perform WindowResize (Task.map getWindowSize Dom.getViewport)
    )


graphFilesDecoder : Decoder (Files ( String, GraphFile ))
graphFilesDecoder =
    let
        fileDecoder =
            JD.map2 Tuple.pair
                (JD.field "description"
                    (JD.succeed "Loaded the graph from local storage")
                )
                (JD.field "graphFile" GF.decoder)
    in
    Files.decoder fileDecoder


getWindowSize viewPort =
    { width = round viewPort.scene.width
    , height = round viewPort.scene.height
    }


mousePosition : Decoder MousePosition
mousePosition =
    JD.map2 MousePosition
        (JD.field "clientX" JD.int)
        (JD.field "clientY" JD.int)


view : Model -> Document Msg
view m =
    { title = "Kite"
    , body =
        [ mainSvg m
        , viewHelper m
        ]
    }


encodeGraphFiles : Files ( String, GraphFile ) -> Value
encodeGraphFiles graphFiles =
    let
        encodeFileData ( _, graphFile ) =
            JE.object
                [ ( "description", JE.null )
                , ( "graphFile", GF.encode graphFile )
                ]
    in
    Files.encode encodeFileData graphFiles


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    case msg of
        ClickOnSaveFile ->
            let
                newModel =
                    updateHelper msg m
            in
            ( newModel
            , setStorage (JE.encode 4 (encodeGraphFiles newModel.files))
            )

        FromElmDep elmDepMsg ->
            let
                newModel =
                    updateHelper msg m

                ( newElmDep, elmDepCmd ) =
                    ElmDep.update elmDepMsg newModel.elmDep

                addGraphFileIfDownloadFinished =
                    case ElmDep.finishedDownloadingWith newElmDep of
                        Just l ->
                            Files.newFile "Elm Dependency"
                                ( "Created elm module dependency graph"
                                , ElmDep.toGraphFile l
                                )

                        Nothing ->
                            identity
            in
            ( { newModel
                | elmDep = newElmDep
                , files = addGraphFileIfDownloadFinished m.files
                , vaderIsOn = False
              }
            , Cmd.map FromElmDep elmDepCmd
            )

        ClickOnGetElmDepButton ->
            let
                newModel =
                    updateHelper msg m
            in
            ( newModel
            , Cmd.map FromElmDep (ElmDep.getPathsOfElmFiles m.elmDep)
            )

        _ ->
            ( updateHelper msg m
            , Cmd.none
            )



-- MODEL


type alias Model =
    { files : Files ( String, GraphFile )

    --
    , distractionFree : Bool

    --
    , focusIsOnSomeTextInput :
        -- This is needed for preventing keypresses to trigger keyboard shortcuts
        Bool

    --
    , animation : Animation

    --
    , timeList : List Time.Posix

    --
    , windowSize : { width : Int, height : Int }
    , mousePosition : MousePosition
    , svgMousePosition : Point2d

    --
    , altIsDown : Bool
    , ctrlIsDown : Bool
    , shiftIsDown : Bool

    --
    , pan :
        -- This is the svg coordinates of the top left corner of the browser window
        Point2d
    , zoom : Float

    --
    , vaderIsOn : Bool

    --
    , openedFilesIsExpanded : Bool
    , allFilesIsExpanded : Bool

    --
    , vertexColorPickerIsExpanded : Bool
    , edgeColorPickerIsExpanded : Bool
    , bagColorPickerIsExpanded : Bool

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
    , selectedMode : Mode

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
    , elmDep : ElmDep.Model
    }


type Animation
    = NoAnimation
    | ForceAnimation Force.State
    | TransitionAnimation
        { startGraph : GraphFile
        , endGraph : GraphFile
        , transitionState : Transition.State
        }


type Mode
    = GraphsFolder
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


defaultGraphFiles : Files ( String, GraphFile )
defaultGraphFiles =
    Files.singleton "my-first-graph"
        ( "Started with empty graph", GF.default )


initialModel : Maybe (Files ( String, GraphFile )) -> Model
initialModel maybeSavedFiles =
    { files = maybeSavedFiles |> Maybe.withDefault defaultGraphFiles

    --
    , distractionFree = False

    --
    , focusIsOnSomeTextInput = False

    --
    , animation = NoAnimation

    --
    , timeList = []
    , windowSize = { width = 800, height = 600 }
    , mousePosition = { x = 0, y = 0 }
    , svgMousePosition = Point2d.fromCoordinates ( 0, 0 )

    --
    , altIsDown = False
    , ctrlIsDown = False
    , shiftIsDown = False

    --
    , pan = initialPan
    , zoom = 1

    --
    , vaderIsOn = True

    --
    , openedFilesIsExpanded = True
    , allFilesIsExpanded = True

    --
    , vertexColorPickerIsExpanded = False
    , edgeColorPickerIsExpanded = False
    , bagColorPickerIsExpanded = False

    --
    , selectedMode = GraphGenerators

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

    --
    , elmDep = ElmDep.initialModel
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
    | ForceTick Time.Posix
      --
    | TransitionTimeDelta Float
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
    | KeyDownCtrl
    | KeyUpCtrl
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
    | ToggleAllFiles
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
    | InputVertexLabelSize String
    | InputVertexLabelPosition GF.LabelPosition
    | InputVertexRadius Float
    | InputVertexGravityStrengthX Float
    | InputVertexGravityStrengthY Float
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
    | ClickOnDuplicateFile
    | ClickOnDeleteFile
    | ClickOnSaveFile
    | ClickOnCloseFile
    | ClickOnFileItem String
    | InputRenameFile String
    | FocusNextFile
    | FocusPreviousFile
      --
    | ClickOnRunDijsktraButton
    | ClickOnRunTopoSort
      --
    | FromElmDep ElmDep.Msg
    | ClickOnGetElmDepButton


reheatForce : Model -> Model
reheatForce m =
    if m.vaderIsOn then
        { m | animation = ForceAnimation Force.defaultForceState }

    else
        m


setAlphaTarget : Float -> Model -> Model
setAlphaTarget aT m =
    { m
        | animation =
            case m.animation of
                ForceAnimation forceState ->
                    ForceAnimation (Force.alphaTarget aT forceState)

                _ ->
                    m.animation
    }


stopAnimation : Model -> Model
stopAnimation m =
    { m | animation = NoAnimation }


present : Model -> GraphFile
present m =
    Tuple.second (Files.present m.files)


new : GraphFile -> String -> Model -> Model
new newGF description m =
    { m | files = m.files |> Files.new ( description, newGF ) }


setPresentWithoutrecording : GraphFile -> Model -> Model
setPresentWithoutrecording newGF m =
    { m
        | files =
            m.files |> Files.mapPresent (Tuple.mapSecond (always newGF))
    }


withNewGravityCenter : Model -> GraphFile
withNewGravityCenter m =
    let
        updateGravity v =
            { v | gravityCenter = m.svgMousePosition }
    in
    if Set.isEmpty m.selectedVertices then
        present m
            |> GF.updateDefaultVertexProperties updateGravity

    else
        present m
            |> GF.updateVertices m.selectedVertices updateGravity


updateHelper : Msg -> Model -> Model
updateHelper msg m =
    case msg of
        NoOp ->
            m

        ForceTick t ->
            case m.animation of
                ForceAnimation forceState ->
                    if Force.isCompleted forceState then
                        m |> stopAnimation

                    else
                        let
                            ( newForceState, newGF_ ) =
                                GF.forceTick forceState (present m)

                            newGF =
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
                                        newGF_ |> GF.setVertexPositions newVertexPositions

                                    _ ->
                                        newGF_
                        in
                        { m
                            | animation = ForceAnimation newForceState
                            , timeList = t :: m.timeList |> List.take 42
                        }
                            |> setPresentWithoutrecording newGF

                _ ->
                    m

        TransitionTimeDelta timeDelta ->
            case m.animation of
                TransitionAnimation tA ->
                    if Transition.hasFinished tA.transitionState then
                        { m | animation = NoAnimation }

                    else
                        { m
                            | animation =
                                TransitionAnimation
                                    { tA
                                        | transitionState =
                                            Transition.update timeDelta
                                                tA.transitionState
                                    }
                        }

                _ ->
                    m

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

        KeyDownCtrl ->
            { m | ctrlIsDown = True }

        KeyUpCtrl ->
            { m | ctrlIsDown = False }

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
                        , ctrlIsDown = False
                        , altIsDown = False
                    }

                Visible ->
                    m

        ClickOnDistractionFreeButton ->
            { m | distractionFree = not m.distractionFree }

        ClickOnLeftMostBarRadioButton selectedMode ->
            { m | selectedMode = selectedMode }

        ClickOnUndoButton ->
            { m
                | files = Files.undo m.files
                , animation = NoAnimation
                , vaderIsOn = False
            }

        ClickOnRedoButton ->
            { m
                | files = Files.redo m.files
                , animation = NoAnimation
                , vaderIsOn = False
            }

        ClickOnHistoryItem i ->
            { m | files = Files.goToInHistory i m.files }

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
            reheatForce
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
                                        (present m)
                            in
                            { m
                                | selectedVertices = newSelectedVertices
                                , selectedEdges = present m |> GF.inducedEdges newSelectedVertices
                            }

                        LineSelector ->
                            let
                                newSelectedEdges =
                                    GF.edgeIdsIntersectiongLineSegment
                                        (LineSegment2d.from
                                            brushStart
                                            m.svgMousePosition
                                        )
                                        (present m)
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

                        newGF =
                            present m
                                |> GF.setVertexPositions newVertexPositions
                    in
                    m |> setPresentWithoutrecording newGF

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
                    m
                        |> reheatForce
                        |> setPresentWithoutrecording (withNewGravityCenter m)

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
                        | selectedTool = Select SelectIdle
                    }
                        |> setAlphaTarget 0
                        |> new (present m) "Moved some vertices"

                Hand (Panning _) ->
                    { m | selectedTool = Hand HandIdle }

                Gravity GravityDragging ->
                    { m | selectedTool = Gravity GravityIdle }
                        |> new (withNewGravityCenter m)
                            "Changed vertex gravity center"

                _ ->
                    m

        MouseDownOnTransparentInteractionRect ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newGF, sourceId ) =
                            present m |> GF.addVertex m.svgMousePosition
                    in
                    { m
                        | selectedTool = Draw (BrushingNewEdgeWithSourceId sourceId)
                    }
                        |> stopAnimation
                        |> new newGF "Added a vertex"

                Select SelectIdle ->
                    { m | selectedTool = Select (BrushingForSelection { brushStart = m.svgMousePosition }) }

                _ ->
                    m

        MouseUpOnTransparentInteractionRect ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    let
                        ( graphWithAddedVertex, newId ) =
                            present m
                                |> GF.addVertex m.svgMousePosition

                        newGF =
                            graphWithAddedVertex
                                |> GF.addEdge ( sourceId, newId )
                    in
                    { m | selectedTool = Draw DrawIdle }
                        |> reheatForce
                        |> new newGF "Added a vertex and an edge."

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
                    { m | selectedTool = Gravity GravityDragging }
                        |> reheatForce
                        |> new (withNewGravityCenter m)
                            "Changed vertex gravity center"

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
                                ( newGF, newSelectedVertices, newSelectedEdges ) =
                                    present m
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
                                                newGF
                                                    |> GF.getVertexIdsWithPositions newSelectedVertices
                                            }
                                        )
                            }
                                |> setAlphaTarget 0.3
                                |> stopAnimation
                                |> new newGF "Duplicated a subgraph"

                        else
                            { m
                                | selectedTool =
                                    Select
                                        (DraggingSelection
                                            { brushStart = m.svgMousePosition
                                            , vertexPositionsAtStart =
                                                present m
                                                    |> GF.getVertexIdsWithPositions m.selectedVertices
                                            }
                                        )
                            }
                                |> reheatForce
                                |> setAlphaTarget 0.3
                                |> new (present m) "Started dragging subgraph"

                    else
                        let
                            newSelectedVertices =
                                if m.shiftIsDown then
                                    Set.insert id m.selectedVertices

                                else
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
                                            present m
                                                |> GF.getVertexIdsWithPositions newSelectedVertices
                                        }
                                    )
                        }
                            |> reheatForce
                            |> setAlphaTarget 0.3
                            |> new (present m) "Started dragging subgraph"

                _ ->
                    m

        MouseUpOnVertex targetId ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    if sourceId == targetId then
                        { m | selectedTool = Draw DrawIdle }
                            |> reheatForce

                    else
                        let
                            newGF =
                                present m |> GF.addEdge ( sourceId, targetId )
                        in
                        { m | selectedTool = Draw DrawIdle }
                            |> reheatForce
                            |> new newGF "Added an edge"

                _ ->
                    m

        MouseDownOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newGF, newId ) =
                            present m
                                |> GF.divideEdge m.svgMousePosition ( s, t )
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedTool = Draw (BrushingNewEdgeWithSourceId newId)
                    }
                        |> stopAnimation
                        |> new newGF "Divided an edge"

                Select SelectIdle ->
                    if Set.member ( s, t ) m.selectedEdges then
                        if m.altIsDown then
                            let
                                ( newGF, newSelectedVertices, newSelectedEdges ) =
                                    present m
                                        |> GF.duplicateSubgraph m.selectedVertices m.selectedEdges
                            in
                            { m
                                | selectedVertices = newSelectedVertices
                                , selectedEdges = newSelectedEdges
                                , selectedTool =
                                    Select
                                        (DraggingSelection
                                            { brushStart = m.svgMousePosition
                                            , vertexPositionsAtStart = newGF |> GF.getVertexIdsWithPositions newSelectedVertices
                                            }
                                        )
                            }
                                |> stopAnimation
                                |> new newGF "Duplicated a subgraph"

                        else
                            { m
                                | selectedTool =
                                    Select
                                        (DraggingSelection
                                            { brushStart = m.svgMousePosition
                                            , vertexPositionsAtStart =
                                                present m
                                                    |> GF.getVertexIdsWithPositions m.selectedVertices
                                            }
                                        )
                            }
                                |> reheatForce
                                |> setAlphaTarget 0.3
                                |> new (present m) "Started dragging subgraph"

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
                                            present m
                                                |> GF.getVertexIdsWithPositions newSelectedVertices
                                        }
                                    )
                        }
                            |> reheatForce
                            |> setAlphaTarget 0.3
                            |> new (present m) "Started dragging subgraph"

                _ ->
                    m

        MouseUpOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    let
                        ( newGF_, newId ) =
                            present m
                                |> GF.divideEdge m.svgMousePosition ( s, t )

                        newGF =
                            newGF_ |> GF.addEdge ( sourceId, newId )
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedTool = Draw DrawIdle
                    }
                        |> reheatForce
                        |> new newGF "Divided an Edge by the endpoint of another edge"

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

                newGF =
                    present m |> GF.updateBag bagId updateLabel
            in
            m |> new newGF "Changed bag label"

        InputBagConvexHull bagId b ->
            let
                updateCH bag =
                    { bag | hasConvexHull = b }

                newGF =
                    present m |> GF.updateBag bagId updateCH
            in
            m |> new newGF "Toggled bag convex hull"

        InputBagColor bagId color ->
            let
                updateColor bag =
                    { bag | color = color }

                newGF =
                    present m |> GF.updateBag bagId updateColor
            in
            m |> new newGF "Changed bag color"

        InputVertexX str ->
            let
                newGF =
                    present m
                        |> GF.setCentroidX m.selectedVertices
                            (str |> String.toFloat |> Maybe.withDefault 0)
            in
            m |> new newGF "Changed vertex X coordinate"

        InputVertexY str ->
            let
                newGF =
                    present m
                        |> GF.setCentroidY m.selectedVertices
                            (str |> String.toFloat |> Maybe.withDefault 0)
            in
            m |> new newGF "Changed vertex Y coordinate"

        InputVertexLabelSize str ->
            let
                updateLabelSize v =
                    { v | labelSize = String.toFloat str |> Maybe.withDefault 12 }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateLabelSize

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateLabelSize
            in
            m |> new newGF "Changed vertex label size"

        InputVertexLabelPosition lP ->
            let
                updateLabelPosition v =
                    { v | labelPosition = lP }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateLabelPosition

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateLabelPosition
            in
            m |> new newGF "Changed vertex label position"

        InputVertexColor newColor ->
            let
                updateColor v =
                    { v | color = newColor }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m |> GF.updateDefaultVertexProperties updateColor

                    else
                        present m |> GF.updateVertices m.selectedVertices updateColor
            in
            m |> new newGF "Changed vertex label color"

        InputVertexRadius num ->
            let
                updateRadius v =
                    { v | radius = num }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateRadius

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateRadius
            in
            m |> new newGF "Changed vertex radius"

        InputVertexGravityStrengthX num ->
            let
                updateGravityStrengthX v =
                    { v | gravityStrengthX = num }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateGravityStrengthX

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateGravityStrengthX
            in
            m
                |> reheatForce
                |> new newGF "Changed vertex gravity strength in x direction"

        InputVertexGravityStrengthY num ->
            let
                updateGravityStrengthY v =
                    { v | gravityStrengthY = num }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateGravityStrengthY

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateGravityStrengthY
            in
            m
                |> reheatForce
                |> new newGF "Changed vertex gravity strength in y direction"

        InputVertexCharge num ->
            let
                updateManyBodyStrength v =
                    { v | manyBodyStrength = -1 * num }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateManyBodyStrength

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateManyBodyStrength
            in
            m
                |> reheatForce
                |> new newGF "Changed vertex charge"

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

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateLabel

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateLabel
            in
            m |> new newGF "Changed vertex label"

        InputVertexFixed b ->
            let
                updateFixed v =
                    { v | fixed = b }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateFixed

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateFixed
            in
            m
                |> reheatForce
                |> new newGF "Changed vertex fixed property"

        InputVertexLabelVisibility b ->
            let
                updateLabelVisibility v =
                    { v | labelIsVisible = b }

                newGF =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.updateDefaultVertexProperties updateLabelVisibility

                    else
                        present m
                            |> GF.updateVertices m.selectedVertices updateLabelVisibility
            in
            m |> new newGF "Toggled vertex labels"

        InputEdgeLabelVisibility b ->
            let
                updateLabelVisibility v =
                    { v | labelIsVisible = b }

                newGF =
                    if Set.isEmpty m.selectedEdges then
                        present m
                            |> GF.updateDefaultEdgeProperties updateLabelVisibility

                    else
                        present m
                            |> GF.updateEdges m.selectedEdges updateLabelVisibility
            in
            m |> new newGF "Toggled edge labels"

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

                newGF =
                    if Set.isEmpty m.selectedEdges then
                        present m
                            |> GF.updateDefaultEdgeProperties updateLabel

                    else
                        present m
                            |> GF.updateEdges m.selectedEdges updateLabel
            in
            m |> new newGF "Changed edge label"

        InputEdgeColor newColor ->
            let
                updateColor e =
                    { e | color = newColor }

                newGF =
                    if Set.isEmpty m.selectedEdges then
                        present m
                            |> GF.updateDefaultEdgeProperties updateColor

                    else
                        present m
                            |> GF.updateEdges m.selectedEdges updateColor
            in
            m |> new newGF "Changed vertex color"

        InputEdgeThickness num ->
            let
                updateThickness e =
                    { e | thickness = num }

                newGF =
                    if Set.isEmpty m.selectedEdges then
                        present m
                            |> GF.updateDefaultEdgeProperties updateThickness

                    else
                        present m
                            |> GF.updateEdges m.selectedEdges updateThickness
            in
            m |> new newGF "Changed edge thickness"

        InputEdgeDistance num ->
            let
                updateDistance e =
                    { e | distance = num }

                newGF =
                    if Set.isEmpty m.selectedEdges then
                        present m
                            |> GF.updateDefaultEdgeProperties updateDistance

                    else
                        present m
                            |> GF.updateEdges m.selectedEdges updateDistance
            in
            m
                |> reheatForce
                |> new newGF "Changed edge distance"

        InputEdgeStrength num ->
            let
                updateStrength e =
                    { e | strength = num }

                newGF =
                    if Set.isEmpty m.selectedEdges then
                        present m
                            |> GF.updateDefaultEdgeProperties updateStrength

                    else
                        present m
                            |> GF.updateEdges m.selectedEdges updateStrength
            in
            m
                |> reheatForce
                |> new newGF "Changed edge strength"

        ToggleAllFiles ->
            { m | allFilesIsExpanded = not m.allFilesIsExpanded }

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
                newGF =
                    present m |> GF.removeVertices m.selectedVertices
            in
            { m
                | selectedVertices = Set.empty
                , highlightedVertices = Set.empty
                , selectedEdges = Set.empty
                , highlightedEdges = Set.empty
            }
                |> reheatForce
                |> new newGF "Removed some vertices"

        ClickOnBagPlus ->
            let
                ( newGF, idOfTheNewBag ) =
                    present m |> GF.addBag m.selectedVertices
            in
            { m
                | maybeSelectedBag = Just idOfTheNewBag
                , bagsIsOn = True
            }
                |> new newGF "Added a bag"

        ClickOnBagTrash ->
            case m.maybeSelectedBag of
                Just bagId ->
                    let
                        newGF =
                            present m |> GF.removeBag bagId
                    in
                    { m | maybeSelectedBag = Nothing }
                        |> reheatForce
                        |> new newGF "Removed a bag"

                Nothing ->
                    m

        ClickOnEdgeTrash ->
            let
                newGF =
                    present m |> GF.removeEdges m.selectedEdges
            in
            { m
                | highlightedEdges = Set.empty
                , selectedEdges = Set.empty
            }
                |> reheatForce
                |> new newGF "Removed some edges"

        ClickOnEdgeContract ->
            case Set.toList m.selectedEdges of
                [ selectedEdge ] ->
                    let
                        newGF =
                            present m |> GF.contractEdge selectedEdge
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedEdges = Set.empty
                    }
                        |> reheatForce
                        |> new newGF "Contracted an edge"

                _ ->
                    m

        MouseOverVertexItem id ->
            { m | highlightedVertices = Set.singleton id }

        MouseOutVertexItem _ ->
            { m | highlightedVertices = Set.empty }

        ClickOnVertexItem id ->
            { m
                | selectedTool = Select SelectIdle
                , selectedVertices =
                    if m.shiftIsDown then
                        Set.insert id m.selectedVertices

                    else
                        Set.singleton id
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
            { m
                | highlightedVertices =
                    present m |> GF.getVerticesInBag bagId
            }

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
                        , present m |> GF.getVerticesInBag bagId
                        )
            in
            { m
                | maybeSelectedBag = newMaybeSelectedBag
                , selectedVertices = newSelectedVertices
                , selectedEdges = Set.empty
            }

        ClickOnGenerateStarGraphButton ->
            let
                newGF =
                    present m |> GF.addStarGraph { numberOfLeaves = 20 }
            in
            m |> new newGF "Added a generated graph"

        ClickOnNewFile ->
            { m
                | files =
                    Files.newFile "New Graph"
                        ( "Started with empty graph", GF.default )
                        m.files
            }
                |> stopAnimation

        ClickOnDuplicateFile ->
            { m | files = Files.duplicate m.files }

        ClickOnDeleteFile ->
            { m | files = Files.delete m.files }

        ClickOnSaveFile ->
            { m | files = Files.save m.files }

        ClickOnCloseFile ->
            { m | files = Files.close m.files }

        InputRenameFile str ->
            { m | files = Files.rename str m.files }

        ClickOnFileItem name ->
            let
                newFiles =
                    Files.open name m.files
            in
            { m
                | files = newFiles
                , animation =
                    TransitionAnimation
                        { startGraph = present m
                        , endGraph = Files.present newFiles |> Tuple.second
                        , transitionState = Transition.initialState
                        }
            }

        FocusNextFile ->
            let
                newFiles =
                    Files.openNext m.files
            in
            { m
                | files = newFiles
                , animation =
                    TransitionAnimation
                        { startGraph = present m
                        , endGraph = Files.present newFiles |> Tuple.second
                        , transitionState = Transition.initialState
                        }
            }

        FocusPreviousFile ->
            let
                newFiles =
                    Files.openPrevious m.files
            in
            { m
                | files = newFiles
                , animation =
                    TransitionAnimation
                        { startGraph = present m
                        , endGraph = Files.present newFiles |> Tuple.second
                        , transitionState = Transition.initialState
                        }
            }

        ClickOnRunDijsktraButton ->
            { m
                | files =
                    present m
                        |> Algorithms.Dijkstra.API.run
                        |> List.indexedMap Tuple.pair
                        |> List.foldl
                            (\( i, gF ) ->
                                Files.newFile
                                    ("Dijsktra step-" ++ String.fromInt i)
                                    ( "Generated as step "
                                        ++ String.fromInt i
                                        ++ " of Dijsktra's Algorithm."
                                    , gF
                                    )
                            )
                            m.files
                , selectedMode = GraphsFolder
            }

        ClickOnRunTopoSort ->
            { m
                | files =
                    present m
                        |> Algorithms.TopologicalSorting.API.run
                        |> List.indexedMap Tuple.pair
                        |> List.foldl
                            (\( i, gF ) ->
                                Files.newFile
                                    ("Topological Sort step-" ++ String.fromInt i)
                                    ( "Generated as step "
                                        ++ String.fromInt i
                                        ++ " of Topological Sorting Algorithm."
                                    , gF
                                    )
                            )
                            m.files
                , selectedMode = GraphsFolder
            }

        FromElmDep _ ->
            m

        ClickOnGetElmDepButton ->
            m



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions m =
    Sub.batch
        [ Browser.Events.onResize
            (\w h -> WindowResize { width = w, height = h })
        , Browser.Events.onMouseMove
            (JD.map MouseMove mousePosition)
        , Browser.Events.onMouseMove
            (JD.map MouseMoveForUpdatingSvgPos mousePosition)
        , Browser.Events.onMouseUp
            (JD.map MouseUp mousePosition)
        , Browser.Events.onKeyUp
            (JD.map toKeyUpMsg keyDecoder)
        , Browser.Events.onVisibilityChange
            PageVisibility
        , keyDown m
        , animationFrame m
        ]


keyDown : Model -> Sub Msg
keyDown m =
    if m.focusIsOnSomeTextInput then
        Sub.none

    else
        Browser.Events.onKeyDown (JD.map toKeyDownMsg keyDecoder)


animationFrame : Model -> Sub Msg
animationFrame m =
    case m.animation of
        NoAnimation ->
            Sub.none

        TransitionAnimation _ ->
            Browser.Events.onAnimationFrameDelta TransitionTimeDelta

        ForceAnimation _ ->
            if m.vaderIsOn then
                Browser.Events.onAnimationFrame ForceTick

            else
                Sub.none


toKeyDownMsg : Key -> Msg
toKeyDownMsg key =
    case key of
        Character '[' ->
            FocusPreviousFile

        Character ']' ->
            FocusNextFile

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

        Control "Control" ->
            KeyDownCtrl

        Control "Shift" ->
            KeyDownShift

        _ ->
            NoOp


toKeyUpMsg : Key -> Msg
toKeyUpMsg key =
    case key of
        Control "Alt" ->
            KeyUpAlt

        Control "Control" ->
            KeyUpCtrl

        Control "Shift" ->
            KeyUpShift

        _ ->
            NoOp


type Key
    = Character Char
    | Control String


keyDecoder : Decoder Key
keyDecoder =
    JD.map toKey (JD.field "key" JD.string)


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


viewHelper : Model -> Html Msg
viewHelper m =
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

        fileTabs =
            El.row
                [ El.alignTop
                , El.width El.fill
                , El.height (El.px 40)
                , El.scrollbarX
                , Background.color Colors.menuBackground
                , El.htmlAttribute (HA.style "pointer-events" "auto")
                ]
                (List.filterMap
                    (\vizDatum ->
                        if vizDatum.isOpen then
                            Just (tab vizDatum)

                        else
                            Nothing
                    )
                    (Files.vizData m.files)
                )

        tabStyle vizDatum =
            let
                focusedStyle =
                    if vizDatum.isTheFocused then
                        [ Font.bold
                        , Font.color Colors.white
                        ]

                    else
                        [ Font.regular
                        , Font.color Colors.lightText
                        ]

                editedStyle =
                    if vizDatum.isEdited then
                        [ Font.italic
                        ]

                    else
                        []
            in
            focusedStyle ++ editedStyle

        tab vizDatum =
            El.column
                [ El.width (El.px 140)
                , El.height El.fill
                , Background.color Colors.menuBackground
                , Events.onClick (ClickOnFileItem vizDatum.name)
                , El.mouseDown [ Background.color Colors.black ]
                , El.mouseOver [ Background.color Colors.selectedItem ]
                ]
                [ El.row
                    (tabStyle vizDatum
                        ++ [ El.width El.fill
                           , El.centerY
                           , El.paddingXY 16 0
                           ]
                    )
                    [ El.el [ El.alignLeft, El.width (El.px 80), El.clip ]
                        (El.text vizDatum.name)
                    , if vizDatum.isTheFocused then
                        El.el [ El.alignRight ]
                            (menuHeaderButton
                                { title = "Close"
                                , onClickMsg = ClickOnCloseFile
                                , iconPath = Icons.icons.closeFile
                                }
                            )

                      else
                        El.none
                    ]
                , El.el
                    [ El.width El.fill
                    , El.height (El.px 2)
                    , El.alignBottom
                    , Background.color <|
                        if vizDatum.isTheFocused then
                            Colors.lightText

                        else
                            Colors.menuBackground
                    ]
                    El.none
                ]

        fpsView_ =
            El.el
                [ El.alignBottom
                , El.width El.fill
                ]
                (fpsView m)

        toolButtons_ =
            El.el
                [ El.alignBottom
                , El.width El.fill
                , El.htmlAttribute (HA.style "pointer-events" "auto")
                ]
                (toolButtons m)

        midColWidth =
            m.windowSize.width
                - layoutParams.leftStripeWidth
                - layoutParams.leftBarWidth
                - layoutParams.rightBarWidth

        midColForDistractionFree =
            El.column
                [ El.height El.fill
                , El.width (El.px midColWidth)
                , El.moveRight (toFloat layoutParams.leftBarWidth)
                ]
                [ fpsView_
                , toolButtons_
                ]

        midCol =
            El.column
                [ El.height El.fill
                , El.width (El.px midColWidth)
                ]
                [ fileTabs
                , fpsView_
                , toolButtons_
                ]
    in
    if m.distractionFree then
        [ onlyYinYangInsteadOfLeftStripe
        , midColForDistractionFree
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
        , El.centerX
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
                [ modeButton "Graphs Folder" GraphsFolder Icons.icons.folder
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
            GraphsFolder ->
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
    , headerItems : List (Element Msg)
    , toggleMsg : Msg
    , contentItems : List (Element Msg)
    }
    -> Element Msg
menu { headerText, isOn, headerItems, toggleMsg, contentItems } =
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
                [ onOffButton
                , El.text headerText
                , El.row [ El.spacing 6, El.alignRight ] headerItems
                ]

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


menuHeaderButton :
    { title : String
    , onClickMsg : Msg
    , iconPath : String
    }
    -> Element Msg
menuHeaderButton { title, onClickMsg, iconPath } =
    El.el
        [ El.htmlAttribute (HA.title title)
        , Events.onClick onClickMsg
        , Border.rounded 2
        , El.mouseDown [ Background.color Colors.selectedItem ]
        , El.mouseOver [ Background.color Colors.mouseOveredItem ]
        , El.pointer
        ]
        (El.html (Icons.draw14px iconPath))


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
    , El.scrollbarX
    ]


leftBarContentForFiles : Model -> Element Msg
leftBarContentForFiles m =
    let
        vizData =
            Files.vizData m.files

        --
        unfocusedAttr vizDatum =
            [ El.width El.fill
            , El.paddingXY 8 8
            , El.height (El.px 30)
            , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
            , Border.color Colors.menuBorder
            , Events.onClick (ClickOnFileItem vizDatum.name)
            ]

        focusedAttr vizDatum =
            unfocusedAttr vizDatum ++ [ Font.bold, Font.color Colors.white ]

        attr vizDatum =
            if vizDatum.isTheFocused then
                focusedAttr vizDatum

            else
                unfocusedAttr vizDatum

        --
        allFilesItem vizDatum =
            El.row (attr vizDatum)
                [ El.text vizDatum.name ]

        allFilesContent =
            El.column [ El.width El.fill ]
                (List.map allFilesItem vizData)
    in
    El.column [ El.width El.fill ]
        [ menu
            { headerText = "All Files"
            , isOn = m.allFilesIsExpanded
            , headerItems =
                [ textInput
                    { labelText = ""
                    , labelWidth = 0
                    , inputWidth = 80
                    , text = Files.getName m.files
                    , onChange = InputRenameFile
                    }
                , menuHeaderButton
                    { title = "New File"
                    , onClickMsg = ClickOnNewFile
                    , iconPath = Icons.icons.plus
                    }
                , menuHeaderButton
                    { title = "Duplicate File"
                    , onClickMsg = ClickOnDuplicateFile
                    , iconPath = Icons.icons.duplicate
                    }
                , menuHeaderButton
                    { title = "Delete File"
                    , onClickMsg = ClickOnDeleteFile
                    , iconPath = Icons.icons.trash
                    }
                ]
            , toggleMsg = ToggleAllFiles
            , contentItems = [ allFilesContent ]
            }
        ]


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
                { data = GF.getVertices (present m)
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
                                    El.text (String.fromInt (round label.radius))
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
                { data = GF.getEdges (present m)
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
            , headerItems =
                [ menuHeaderButton
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
            , headerItems =
                [ menuHeaderButton
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
        , headerItems = []
        , toggleMsg = NoOp
        , contentItems = []
        }


leftBarContentForGraphQueries : Model -> Element Msg
leftBarContentForGraphQueries m =
    menu
        { headerText = "Graph Queries (coming soon)"
        , isOn = True
        , headerItems = []
        , toggleMsg = NoOp
        , contentItems = []
        }


buttonWithIconAndText :
    { iconPath : String
    , text : String
    , onClickMsg : Msg
    , disabled : Bool
    }
    -> Element Msg
buttonWithIconAndText p =
    let
        commonAttributes =
            [ Border.width 1
            , Border.color Colors.menuBorder
            , Border.rounded 16
            , El.padding 4
            ]

        occasionalAttributes =
            if p.disabled then
                [ El.alpha 0.1
                ]

            else
                [ El.pointer
                , El.mouseDown [ Background.color Colors.selectedItem ]
                , El.mouseOver [ Background.color Colors.mouseOveredItem ]
                , Events.onClick p.onClickMsg
                ]
    in
    El.row (commonAttributes ++ occasionalAttributes)
        [ El.html (Icons.draw24px p.iconPath)
        , El.el [ El.paddingXY 10 0 ] (El.text p.text)
        ]


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
                (El.html (Icons.draw24px Icons.icons.lightning))

        listOfFileNames : List String -> Element Msg
        listOfFileNames l =
            El.column [ El.padding 10 ]
                (List.map (\n -> El.el [] (El.text ("- " ++ n))) l)
    in
    El.column [ El.width El.fill ]
        [ --    menu
          --    { headerText = "Basic Graphs"
          --    , isOn = True
          --    , headerItems = []
          --    , toggleMsg = NoOp
          --    , contentItems =
          --        [ El.row [ El.padding 10, El.spacing 5 ]
          --            [ generateButton ClickOnGenerateStarGraphButton
          --            , El.el
          --                [ Font.bold ]
          --                (El.text "Star Graph")
          --            ]
          --        , textInput
          --            { labelText = "Number of Leaves"
          --            , labelWidth = 100
          --            , inputWidth = 40
          --            , text = "TODO"
          --            , onChange = always NoOp
          --            }
          --        ]
          --    }
          --,
          menu
            { headerText = "Elm Module Dependency Graph"
            , isOn = True
            , headerItems = []
            , toggleMsg = NoOp
            , contentItems =
                [ El.column [ El.width El.fill, El.spacing 16, El.padding 16 ]
                    [ El.paragraph []
                        [ El.text "To see the module dependency graph of an "
                        , El.newTabLink
                            [ Font.underline
                            , Font.italic

                            --, Font.color Colors.linkBlue
                            ]
                            { url = "https://elm-lang.org/"
                            , label =
                                El.text "Elm"
                            }
                        , El.text " project, enter its github repository path and hit the button below."
                        ]
                    , textInput
                        { labelText = "https://github.com/"
                        , labelWidth = 90
                        , inputWidth = 120
                        , text = m.elmDep.repoName
                        , onChange = ElmDep.ChangeRepo >> FromElmDep
                        }
                    , El.el [ El.centerX ]
                        (buttonWithIconAndText
                            { iconPath = Icons.icons.elmLogo
                            , text = "Get Module Dependency Graph!"
                            , onClickMsg = ClickOnGetElmDepButton
                            , disabled =
                                case ElmDep.stateVizData m.elmDep of
                                    ElmDep.DownloadingViz _ ->
                                        True

                                    _ ->
                                        False
                            }
                        )
                    , case ElmDep.stateVizData m.elmDep of
                        ElmDep.WaitingForUserInputViz ->
                            El.none

                        ElmDep.DownloadingViz { numberOfModules, namesOfDownloadedModules } ->
                            El.textColumn []
                                [ El.paragraph []
                                    [ El.text "Downloading files: "
                                    , El.text
                                        (String.fromInt
                                            (List.length namesOfDownloadedModules)
                                        )
                                    , El.text "/"
                                    , El.text (String.fromInt numberOfModules)
                                    ]
                                , El.paragraph [] [ listOfFileNames namesOfDownloadedModules ]
                                ]

                        ElmDep.DownloadFinishedViz { namesOfDownloadedModules } ->
                            El.textColumn []
                                [ El.paragraph []
                                    [ El.text "Finished downloading all "
                                    , El.text (String.fromInt (List.length namesOfDownloadedModules))
                                    , El.text " files:"
                                    ]
                                , El.paragraph [] [ listOfFileNames namesOfDownloadedModules ]
                                ]

                        ElmDep.ErrorViz str ->
                            El.paragraph []
                                [ El.el [ Font.color Colors.red ]
                                    (El.text str)
                                ]
                    ]
                ]
            }

        --, menu
        --    { headerText = "Random Graphs (coming soon)"
        --    , isOn = False
        --    , headerItems = []
        --    , toggleMsg = NoOp
        --    , contentItems = []
        --    }
        ]


runButton : Msg -> Element Msg
runButton msg =
    El.el
        [ El.htmlAttribute (HA.title "Run!")
        , El.alignRight
        , Border.rounded 4
        , El.mouseDown [ Background.color Colors.selectedItem ]
        , El.mouseOver [ Background.color Colors.mouseOveredItem ]
        , El.pointer
        , Events.onClick msg
        ]
        (El.html (Icons.draw24px Icons.icons.lightning))


leftBarContentForAlgorithmVisualizations : Model -> Element Msg
leftBarContentForAlgorithmVisualizations m =
    El.column []
        [ menu
            { headerText = "Dijsktra's Shortest Path"
            , isOn = True
            , headerItems = []
            , toggleMsg = NoOp
            , contentItems =
                [ El.textColumn [ El.width El.fill, El.padding 16, El.spacing 10 ]
                    [ El.paragraph []
                        [ El.text
                            "When you hit the lightning button, "
                        , El.el
                            [ El.alignLeft
                            ]
                            (runButton ClickOnRunDijsktraButton)
                        , El.newTabLink
                            [ Font.underline
                            , Font.italic

                            --, Font.color Colors.linkBlue
                            ]
                            { url =
                                "https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm"
                            , label =
                                El.text "Dijkstra's Shortest Path Algorithm"
                            }
                        , El.text
                            " is going to run on the current graph."
                        ]
                    , El.paragraph []
                        [ El.text "If an edge is labeled by a number, that number will be treated as the edge distance. Otherwise, the edge will be assigned the default distance, which is 1." ]
                    , El.paragraph []
                        [ El.text "If there is vertex labeled with \"start\", then this vertex will be the start vertex, otherwise the start vertex will be the vertex with the smallest id."
                        ]
                    ]
                ]
            }
        , menu
            { headerText = "Topological Sorting"
            , isOn = True
            , headerItems = []
            , toggleMsg = NoOp
            , contentItems =
                [ El.textColumn [ El.width El.fill, El.padding 16, El.spacing 10 ]
                    [ El.paragraph []
                        [ El.text
                            "When you hit the lightning button, "
                        , El.el
                            [ El.alignLeft
                            ]
                            (runButton ClickOnRunTopoSort)
                        , El.newTabLink
                            [ Font.underline
                            , Font.italic

                            --, Font.color Colors.linkBlue
                            ]
                            { url =
                                "https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm"
                            , label =
                                El.text "Kahn's algorithm"
                            }
                        , El.text
                            " is going to run on the current graph."
                        ]
                    ]
                ]
            }
        ]


leftBarContentForGamesOnGraphs : Model -> Element Msg
leftBarContentForGamesOnGraphs m =
    menu
        { headerText = "Games on Graphs (coming soon)"
        , isOn = True
        , headerItems = []
        , toggleMsg = NoOp
        , contentItems = []
        }


leftBarContentForPreferences : Model -> Element Msg
leftBarContentForPreferences m =
    menu
        { headerText = "Preferences (coming soon)"
        , isOn = True
        , headerItems = []
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


toolButtons : Model -> Element Msg
toolButtons m =
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
                    { title = "Save"
                    , iconPath = Icons.icons.save
                    , onClickMsg = ClickOnSaveFile
                    , disabled = False
                    }
                ]
            , oneClickButtonGroup
                [ oneClickButton
                    { title = "Undo"
                    , iconPath = Icons.icons.undo
                    , onClickMsg = ClickOnUndoButton
                    , disabled = not (m.files |> Files.hasPast)
                    }
                , oneClickButton
                    { title = "Redo"
                    , iconPath = Icons.icons.redo
                    , onClickMsg = ClickOnRedoButton
                    , disabled = not (m.files |> Files.hasFuture)
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
        , Font.regular
        ]
        { onChange = onChange
        , text = text
        , placeholder = Nothing
        , label = Input.labelLeft (labelAttr labelWidth) (El.text labelText)
        }


sliderInput :
    { labelText : String
    , labelWidth : Int
    , totalWidth : Int
    , value : Float
    , min : Float
    , max : Float
    , step : Float
    , onChange : Float -> Msg
    }
    -> Element Msg
sliderInput { labelText, labelWidth, totalWidth, value, min, max, step, onChange } =
    El.el [ El.width (El.px totalWidth) ] <|
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


labelPositionInput : LabelPosition -> Element Msg
labelPositionInput labelPosToShow =
    let
        box : LabelPosition -> Element Msg
        box lP =
            El.el
                [ Background.color
                    (if lP == labelPosToShow then
                        Colors.icon

                     else
                        Colors.inputBackground
                    )
                , El.width (El.px 6)
                , El.height (El.px 6)
                , Events.onClick (InputVertexLabelPosition lP)
                , El.pointer
                ]
                El.none

        boxesColumn =
            El.column [ El.padding 1, El.spacing 1 ]

        boxesRow =
            El.row [ El.spacing 1 ]

        nineBoxes =
            boxesColumn
                [ boxesRow
                    [ box LabelTopLeft, box LabelTop, box LabelTopRight ]
                , boxesRow
                    [ box LabelLeft, box LabelCenter, box LabelRight ]
                , boxesRow
                    [ box LabelBottomLeft, box LabelBottom, box LabelBottomRight ]
                ]
    in
    El.row
        [ El.spacing 8
        ]
        [ El.el (labelAttr 95) (El.text "Label Position")
        , El.el [ El.centerX, El.centerY ] nineBoxes
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
                |> Files.uLWSVizData
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
        , headerItems = []
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
        , headerItems = []
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
                { data = GF.getBags (present m)
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
                                        (present m
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
                        [ colorPicker
                            { labelText = "Color"
                            , labelWidth = 80
                            , isExpanded = m.bagColorPickerIsExpanded
                            , selectedColor =
                                GF.getBagProperties idOfTheSelectedBag
                                    (present m)
                                    |> Maybe.map .color
                            , msgOnColorClick = InputBagColor idOfTheSelectedBag
                            , msgOnExpanderClick = ClickOnBagColorPicker
                            , msgOnLeave = MouseLeaveBagColorPicker
                            }
                        , checkbox
                            { labelText = "Convex Hull"
                            , labelWidth = 80
                            , state =
                                GF.getBagProperties idOfTheSelectedBag
                                    (present m)
                                    |> Maybe.map .hasConvexHull
                            , onChange = InputBagConvexHull idOfTheSelectedBag
                            }
                        ]
                    , El.row []
                        [ textInput
                            { labelText = "Label"
                            , labelWidth = 80
                            , inputWidth = 60
                            , text =
                                GF.getBagProperties idOfTheSelectedBag (present m)
                                    |> Maybe.map .label
                                    |> Maybe.withDefault Nothing
                                    |> Maybe.withDefault ""
                            , onChange = InputBagLabel idOfTheSelectedBag
                            }
                        ]
                    ]
    in
    menu
        { headerText = "Bags"
        , isOn = m.bagsIsOn
        , headerItems =
            [ menuHeaderButton
                { title = "Add New Bag"
                , onClickMsg = ClickOnBagPlus
                , iconPath = Icons.icons.plus
                }
            , menuHeaderButton
                { title = "Remove Selected Bag"
                , onClickMsg = ClickOnBagTrash
                , iconPath = Icons.icons.trash
                }
            ]
        , toggleMsg = ToggleBags
        , contentItems =
            [ tableOfBags
            , El.column [ El.height (El.px 44), El.spacing 5 ] maybeBagPreferences
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
        , headerItems = []
        , toggleMsg = ToggleVertexPreferences
        , contentItems =
            [ El.row []
                [ colorPicker
                    { labelText = "Color"
                    , labelWidth = 80
                    , isExpanded = m.vertexColorPickerIsExpanded
                    , selectedColor =
                        if Set.isEmpty m.selectedVertices then
                            Just
                                (present m
                                    |> GF.getDefaultVertexProperties
                                    |> .color
                                )

                        else
                            present m
                                |> GF.getCommonVertexProperty m.selectedVertices .color
                    , msgOnColorClick = InputVertexColor
                    , msgOnExpanderClick = ClickOnVertexColorPicker
                    , msgOnLeave = MouseLeaveVertexColorPicker
                    }
                , sliderInput
                    { labelText = "Radius"
                    , labelWidth = 60
                    , totalWidth = 134
                    , value =
                        if Set.isEmpty m.selectedVertices then
                            present m
                                |> GF.getDefaultVertexProperties
                                |> .radius

                        else
                            case present m |> GF.getCommonVertexProperty m.selectedVertices .radius of
                                Just r ->
                                    r

                                Nothing ->
                                    5
                    , min = 4
                    , max = 20
                    , step = 1
                    , onChange = InputVertexRadius
                    }
                ]
            , El.row []
                [ textInput
                    { labelText = "Label"
                    , labelWidth = 80
                    , inputWidth = 60
                    , text =
                        if Set.isEmpty m.selectedVertices then
                            present m
                                |> GF.getDefaultVertexProperties
                                |> .label
                                |> Maybe.withDefault ""

                        else
                            case present m |> GF.getCommonVertexProperty m.selectedVertices .label of
                                Just (Just l) ->
                                    l

                                _ ->
                                    ""
                    , onChange = InputVertexLabel
                    }
                , checkbox
                    { labelText = "Show Label"
                    , labelWidth = 68
                    , state =
                        if Set.isEmpty m.selectedVertices then
                            Just
                                (present m
                                    |> GF.getDefaultVertexProperties
                                    |> .labelIsVisible
                                )

                        else
                            present m
                                |> GF.getCommonVertexProperty m.selectedVertices .labelIsVisible
                    , onChange =
                        InputVertexLabelVisibility
                    }
                ]
            , El.row []
                [ textInput
                    { labelText = "Label Size"
                    , labelWidth = 80
                    , inputWidth = 30
                    , text =
                        if Set.isEmpty m.selectedVertices then
                            present m
                                |> GF.getDefaultVertexProperties
                                |> .labelSize
                                |> round
                                |> String.fromInt

                        else
                            case present m |> GF.getCommonVertexProperty m.selectedVertices .labelSize of
                                Just lS ->
                                    String.fromInt (round lS)

                                _ ->
                                    ""
                    , onChange = InputVertexLabelSize
                    }
                , labelPositionInput
                    (if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.getDefaultVertexProperties
                            |> .labelPosition

                     else
                        case present m |> GF.getCommonVertexProperty m.selectedVertices .labelPosition of
                            Just lP ->
                                lP

                            Nothing ->
                                LabelCenter
                    )
                ]
            , El.row []
                [ checkbox
                    { labelText = "Fixed"
                    , labelWidth = 80
                    , state =
                        if Set.isEmpty m.selectedVertices then
                            Just
                                (present m
                                    |> GF.getDefaultVertexProperties
                                    |> .fixed
                                )

                        else
                            present m
                                |> GF.getCommonVertexProperty m.selectedVertices .fixed
                    , onChange = InputVertexFixed
                    }
                , textInput
                    { labelText = "X"
                    , labelWidth = 20
                    , inputWidth = 40
                    , text =
                        present m
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
                        present m
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
                , totalWidth = 240
                , value =
                    -1
                        * (let
                            defaultVertexManyBodyStrength =
                                present m
                                    |> GF.getDefaultVertexProperties
                                    |> .manyBodyStrength
                           in
                           if Set.isEmpty m.selectedVertices then
                            defaultVertexManyBodyStrength

                           else
                            present m
                                |> GF.getCommonVertexProperty m.selectedVertices .manyBodyStrength
                                |> Maybe.withDefault defaultVertexManyBodyStrength
                          )
                , min = 50
                , max = 2000
                , step = 50
                , onChange = InputVertexCharge
                }
            , sliderInput
                { labelText = "GravityX"
                , labelWidth = 80
                , totalWidth = 240
                , value =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.getDefaultVertexProperties
                            |> .gravityStrengthX

                    else
                        case present m |> GF.getCommonVertexProperty m.selectedVertices .gravityStrengthX of
                            Just gS ->
                                gS

                            Nothing ->
                                0.1
                , min = 0
                , max = 1
                , step = 0.05
                , onChange = InputVertexGravityStrengthX
                }
            , sliderInput
                { labelText = "GravityY"
                , labelWidth = 80
                , totalWidth = 240
                , value =
                    if Set.isEmpty m.selectedVertices then
                        present m
                            |> GF.getDefaultVertexProperties
                            |> .gravityStrengthY

                    else
                        case present m |> GF.getCommonVertexProperty m.selectedVertices .gravityStrengthY of
                            Just gS ->
                                gS

                            Nothing ->
                                0.1
                , min = 0
                , max = 1
                , step = 0.05
                , onChange = InputVertexGravityStrengthY
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
        , headerItems = []
        , toggleMsg = ToggleEdgePreferences
        , contentItems =
            [ El.row []
                [ colorPicker
                    { labelText = "Color"
                    , labelWidth = 80
                    , isExpanded = m.edgeColorPickerIsExpanded
                    , selectedColor =
                        if Set.isEmpty m.selectedEdges then
                            Just
                                (present m
                                    |> GF.getDefaultEdgeProperties
                                    |> .color
                                )

                        else
                            present m
                                |> GF.getCommonEdgeProperty m.selectedEdges .color
                    , msgOnColorClick = InputEdgeColor
                    , msgOnExpanderClick = ClickOnEdgeColorPicker
                    , msgOnLeave = MouseLeaveEdgeColorPicker
                    }
                , sliderInput
                    { labelText = "Thickness"
                    , labelWidth = 60
                    , totalWidth = 134
                    , value =
                        if Set.isEmpty m.selectedEdges then
                            present m
                                |> GF.getDefaultEdgeProperties
                                |> .thickness

                        else
                            present m
                                |> GF.getCommonEdgeProperty m.selectedEdges .thickness
                                |> Maybe.withDefault 3
                    , min = 1
                    , max = 20
                    , step = 1
                    , onChange = InputEdgeThickness
                    }
                ]
            , El.row []
                [ textInput
                    { labelText = "Label"
                    , labelWidth = 80
                    , inputWidth = 60
                    , text =
                        if Set.isEmpty m.selectedEdges then
                            present m
                                |> GF.getDefaultEdgeProperties
                                |> .label
                                |> Maybe.withDefault ""

                        else
                            case present m |> GF.getCommonEdgeProperty m.selectedEdges .label of
                                Just (Just l) ->
                                    l

                                _ ->
                                    ""
                    , onChange = InputEdgeLabel
                    }
                , checkbox
                    { labelText = "Show Label"
                    , labelWidth = 68
                    , state =
                        if Set.isEmpty m.selectedEdges then
                            Just
                                (present m
                                    |> GF.getDefaultEdgeProperties
                                    |> .labelIsVisible
                                )

                        else
                            present m
                                |> GF.getCommonEdgeProperty m.selectedEdges .labelIsVisible
                    , onChange =
                        InputEdgeLabelVisibility
                    }
                ]
            , sliderInput
                { labelText = "Distance"
                , labelWidth = 80
                , totalWidth = 240
                , value =
                    if Set.isEmpty m.selectedEdges then
                        present m
                            |> GF.getDefaultEdgeProperties
                            |> .distance

                    else
                        present m
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
                , totalWidth = 240
                , value =
                    if Set.isEmpty m.selectedEdges then
                        present m
                            |> GF.getDefaultEdgeProperties
                            |> .strength

                    else
                        present m
                            |> GF.getCommonEdgeProperty m.selectedEdges .strength
                            |> Maybe.withDefault 0.7
                , min = 0
                , max = 1
                , step = 0.05
                , onChange = InputEdgeStrength
                }
            ]
        }



--MAIN SVG


wheelDeltaY : Decoder Int
wheelDeltaY =
    JD.field "deltaY" JD.int


emptySvgElement =
    S.g [] []


mainSvg : Model -> Html Msg
mainSvg m =
    let
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

        gFToShow =
            case m.animation of
                TransitionAnimation { startGraph, endGraph, transitionState } ->
                    GF.transitionGraphFile
                        (Transition.elapsedTimeRatio transitionState)
                        { start = startGraph
                        , end = endGraph
                        }

                _ ->
                    present m
    in
    S.svg
        [ HA.style "background-color" (Colors.toString Colors.mainSvgBackground)
        , HA.style "cursor" cursor
        , HA.style "position" "absolute"
        , SA.width (String.fromInt mainSvgWidth)
        , SA.height (String.fromInt mainSvgHeight)
        , SA.viewBox (svgViewBoxFromPanAndZoom m.pan m.zoom)
        , SE.onMouseDown MouseDownOnMainSvg
        , HE.on "wheel" (JD.map WheelDeltaY wheelDeltaY)
        ]
        [ maybeGravityLines m.selectedTool gFToShow
        , pageA4WithRuler m.zoom
        , viewHulls gFToShow
        , maybeBrushedEdge m.selectedTool m.svgMousePosition gFToShow
        , transparentInteractionRect
        , maybeHighlightsOnSelectedEdges m.selectedEdges gFToShow
        , maybeHighlightOnMouseOveredEdges m.highlightedEdges gFToShow
        , maybeHighlightsOnSelectedVertices m.selectedVertices gFToShow
        , maybeHighlightOnMouseOveredVertices m.highlightedVertices gFToShow
        , viewEdges gFToShow
        , viewVertices gFToShow
        , maybeBrushedSelector
        , maybeRectAroundSelectedVertices m.selectedTool m.selectedVertices gFToShow
        , maybeViewGravityCenters m.selectedTool gFToShow
        ]


maybeGravityLines : Tool -> GraphFile -> Html Msg
maybeGravityLines tool graphFile =
    case tool of
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
            S.g [] (graphFile |> GF.getVertices |> List.map viewGravityLine)

        _ ->
            emptySvgElement


pageA4WithRuler : Float -> Html Msg
pageA4WithRuler zoom =
    let
        a4HeightByWidth =
            297 / 210

        backgroundPageWidth =
            600
    in
    S.g []
        [ S.rect
            [ SA.x "0"
            , SA.y "0"
            , SA.width (String.fromFloat backgroundPageWidth)
            , SA.height (String.fromFloat (backgroundPageWidth * a4HeightByWidth))
            , SA.stroke (Colors.toString Colors.svgLine)
            , SA.fill "none"
            , SA.strokeWidth (String.fromFloat (1 / zoom))
            ]
            []
        , S.line
            [ SA.x1 "100"
            , SA.y1 "0"
            , SA.x2 "100"
            , SA.y2 (String.fromFloat (-5 / zoom))
            , SA.stroke (Colors.toString Colors.svgLine)
            , SA.strokeWidth (String.fromFloat (1 / zoom))
            ]
            []
        , S.text_
            [ SA.x "100"
            , SA.y (String.fromFloat (-24 / zoom))
            , SA.fill (Colors.toString Colors.svgLine)
            , SA.textAnchor "middle"
            , SA.fontSize (String.fromFloat (12 / zoom))
            ]
            [ S.text <| String.fromInt (round (100 * zoom)) ++ "%" ]
        , S.text_
            [ SA.x "100"
            , SA.y (String.fromFloat (-10 / zoom))
            , SA.fill (Colors.toString Colors.svgLine)
            , SA.textAnchor "middle"
            , SA.fontSize (String.fromFloat (12 / zoom))
            ]
            [ S.text <| "100px" ]
        ]


maybeBrushedEdge : Tool -> Point2d -> GraphFile -> Html Msg
maybeBrushedEdge tool svgMousePosition graphFile =
    case tool of
        Draw (BrushingNewEdgeWithSourceId sourceId) ->
            case graphFile |> GF.getVertexProperties sourceId of
                Just { position } ->
                    let
                        dEP =
                            graphFile |> GF.getDefaultEdgeProperties
                    in
                    Geometry.Svg.lineSegment2d
                        [ SA.strokeWidth (String.fromFloat dEP.thickness)
                        , SA.stroke (Colors.toString dEP.color)
                        ]
                        (LineSegment2d.from position svgMousePosition)

                Nothing ->
                    emptySvgElement

        _ ->
            emptySvgElement


maybeHighlightsOnSelectedEdges : Set EdgeId -> GraphFile -> Html Msg
maybeHighlightsOnSelectedEdges selectedEdges graphFile =
    let
        drawHL { from, to, label } =
            case
                ( graphFile |> GF.getVertexProperties from
                , graphFile |> GF.getVertexProperties to
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
        (graphFile
            |> GF.getEdges
            |> List.filter (\{ from, to } -> Set.member ( from, to ) selectedEdges)
            |> List.map drawHL
        )


maybeHighlightOnMouseOveredEdges : Set EdgeId -> GraphFile -> Html Msg
maybeHighlightOnMouseOveredEdges highlightedEdges graphFile =
    let
        drawHL { from, to, label } =
            case
                ( graphFile |> GF.getVertexProperties from
                , graphFile |> GF.getVertexProperties to
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
        (graphFile
            |> GF.getEdges
            |> List.filter (\{ from, to } -> Set.member ( from, to ) highlightedEdges)
            |> List.map drawHL
        )


maybeHighlightsOnSelectedVertices : Set VertexId -> GraphFile -> Html Msg
maybeHighlightsOnSelectedVertices selectedVertices graphFile =
    let
        drawHL { position, radius } =
            Geometry.Svg.circle2d
                [ SA.fill (Colors.toString Colors.selectBlue) ]
                (position |> Circle2d.withRadius (radius + 4))
    in
    S.g []
        (graphFile
            |> GF.getVertices
            |> List.filter (\{ id } -> Set.member id selectedVertices)
            |> List.map (.label >> drawHL)
        )


maybeHighlightOnMouseOveredVertices : Set VertexId -> GraphFile -> Html Msg
maybeHighlightOnMouseOveredVertices highlightedVertices graphFile =
    let
        drawHL { position, radius } =
            Geometry.Svg.circle2d
                [ SA.fill (Colors.toString Colors.highlightPink) ]
                (position |> Circle2d.withRadius (radius + 4))
    in
    S.g []
        (graphFile
            |> GF.getVertices
            |> List.filter (\{ id } -> Set.member id highlightedVertices)
            |> List.map (.label >> drawHL)
        )


maybeRectAroundSelectedVertices : Tool -> Set VertexId -> GraphFile -> Html Msg
maybeRectAroundSelectedVertices selectedTool selectedVertices graphFile =
    let
        rect selectedVertices_ =
            let
                maybeBoudingBox =
                    graphFile
                        |> GF.getBoundingBoxWithMargin selectedVertices_
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
    case selectedTool of
        Select vertexSelectorState ->
            case vertexSelectorState of
                BrushingForSelection _ ->
                    emptySvgElement

                _ ->
                    rect selectedVertices

        _ ->
            emptySvgElement



-- GRAPH VIEW


arrow :
    { lineSegment : LineSegment2d
    , color : Color
    , thickness : Float
    , headWidth : Float
    , headLength : Float
    }
    -> Html Msg
arrow { lineSegment, color, thickness, headWidth, headLength } =
    let
        dir =
            LineSegment2d.direction lineSegment
                |> Maybe.withDefault Direction2d.positiveX

        angle =
            Direction2d.toAngle dir

        vecFromOriginToEndPoint =
            LineSegment2d.endPoint lineSegment
                |> Point2d.coordinates
                |> Vector2d.fromComponents

        arrowHead =
            Triangle2d.fromVertices
                ( Point2d.fromCoordinates ( 0, -headWidth / 2 )
                , Point2d.fromCoordinates ( 0, headWidth / 2 )
                , Point2d.fromCoordinates ( headLength, 0 )
                )
                |> Triangle2d.rotateAround Point2d.origin angle
                |> Triangle2d.translateBy vecFromOriginToEndPoint
                |> Triangle2d.translateIn dir -headLength
    in
    S.g []
        [ Geometry.Svg.lineSegment2d
            [ SA.stroke (Colors.toString color)
            , SA.strokeWidth (String.fromFloat thickness)
            ]
            (LineSegment2d.from
                (LineSegment2d.startPoint lineSegment)
                (LineSegment2d.endPoint lineSegment
                    |> Point2d.translateIn dir -headLength
                )
            )
        , Geometry.Svg.triangle2d
            [ SA.fill (Colors.toString color)
            ]
            arrowHead
        ]


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
                        |> Vector2d.withLength labelDistance
            in
            edgeLine
                |> LineSegment2d.midpoint
                |> Point2d.translateBy fromEdgeMidpointToLabelMidpoint

        edgeWithKey { from, to, label } =
            case ( GF.getVertexProperties from graphFile, GF.getVertexProperties to graphFile ) of
                ( Just v, Just w ) ->
                    let
                        dir =
                            Direction2d.from v.position w.position
                                |> Maybe.withDefault Direction2d.positiveX

                        edgeStart =
                            v.position |> Point2d.translateIn dir v.radius

                        edgeEnd =
                            w.position |> Point2d.translateIn dir -w.radius

                        edgeLine =
                            LineSegment2d.from edgeStart edgeEnd

                        lP =
                            labelPosition edgeLine

                        eL =
                            S.text_
                                [ SA.x
                                    (String.fromFloat (Point2d.xCoordinate lP))
                                , SA.y
                                    (String.fromFloat (Point2d.yCoordinate lP))
                                , SA.textAnchor "middle"
                                , SA.fontSize (String.fromFloat label.labelSize)
                                , SA.fill (Colors.toString label.labelColor)
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

                        invisibleBackGroundHandle =
                            Geometry.Svg.lineSegment2d
                                [ SA.stroke "red"
                                , SA.strokeOpacity "0"
                                , SA.strokeWidth (String.fromFloat (label.thickness + 6))
                                ]
                                edgeLine
                    in
                    ( edgeIdToString ( from, to )
                    , S.g
                        [ SE.onMouseDown (MouseDownOnEdge ( from, to ))
                        , SE.onMouseUp (MouseUpOnEdge ( from, to ))
                        , SE.onMouseOver (MouseOverEdge ( from, to ))
                        , SE.onMouseOut (MouseOutEdge ( from, to ))
                        ]
                        [ invisibleBackGroundHandle
                        , arrow
                            { lineSegment = edgeLine
                            , color = label.color
                            , thickness = label.thickness
                            , headWidth = 3 * label.thickness
                            , headLength = 3 * label.thickness
                            }
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
                ( x, y ) =
                    Point2d.coordinates label.position

                ( labelAnchor, labelX, labelY ) =
                    case label.labelPosition of
                        GF.LabelTopLeft ->
                            ( "end"
                            , -label.radius - 4
                            , -label.radius - 4
                            )

                        GF.LabelTop ->
                            ( "middle"
                            , 0
                            , -label.radius - 4
                            )

                        GF.LabelTopRight ->
                            ( "start"
                            , label.radius + 4
                            , -label.radius - 4
                            )

                        GF.LabelCenter ->
                            ( "middle"
                            , 0
                            , 0.39 * label.labelSize
                            )

                        GF.LabelLeft ->
                            ( "end"
                            , -label.radius - 4
                            , 0.39 * label.labelSize
                            )

                        GF.LabelRight ->
                            ( "start"
                            , label.radius + 4
                            , 0.39 * label.labelSize
                            )

                        GF.LabelBottomLeft ->
                            ( "end"
                            , -label.radius - 4
                            , label.radius + label.labelSize
                            )

                        GF.LabelBottom ->
                            ( "middle"
                            , 0
                            , label.radius + label.labelSize
                            )

                        GF.LabelBottomRight ->
                            ( "start"
                            , label.radius + 4
                            , label.radius + label.labelSize
                            )

                vertexLabel =
                    if label.labelIsVisible then
                        S.text_
                            [ SA.fill (Colors.toString label.labelColor)
                            , SA.fontSize (String.fromFloat label.labelSize)
                            , SA.textAnchor labelAnchor
                            , SA.x (String.fromFloat labelX)
                            , SA.y (String.fromFloat labelY)
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

                circleSvg : Color -> Float -> Svg msg
                circleSvg c r =
                    Geometry.Svg.circle2d
                        [ SA.fill (Colors.toString c) ]
                        (Point2d.origin |> Circle2d.withRadius r)

                backGroundCircleForBorder =
                    circleSvg label.borderColor label.radius

                innerCircle =
                    circleSvg label.color (label.radius - label.borderWidth)
            in
            ( String.fromInt id
            , S.g
                [ SA.transform <| "translate(" ++ String.fromFloat x ++ "," ++ String.fromFloat y ++ ")"
                , SE.onMouseDown (MouseDownOnVertex id)
                , SE.onMouseUp (MouseUpOnVertex id)
                , SE.onMouseOver (MouseOverVertex id)
                , SE.onMouseOut (MouseOutVertex id)
                ]
                [ backGroundCircleForBorder
                , innerCircle
                , pin label.fixed label.radius
                , vertexLabel
                ]
            )
    in
    Svg.Keyed.node "g" [] (graphFile |> GF.getVertices |> List.map viewVertex)


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


maybeViewGravityCenters : Tool -> GraphFile -> Html Msg
maybeViewGravityCenters selectedTool graphFile =
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
                (.gravityCenter (GF.getDefaultVertexProperties graphFile) |> Circle2d.withRadius 10)
    in
    case selectedTool of
        Gravity _ ->
            S.g [] <|
                viewDefaultGC
                    :: (GF.pullCentersWithVertices graphFile |> Dict.toList |> List.map viewGC)

        _ ->
            emptySvgElement
