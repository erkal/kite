module Main exposing (main)

import BoundingBox2d exposing (BoundingBox2d)
import Browser
import Browser.Dom as Dom
import Browser.Events exposing (Visibility(..))
import Circle2d exposing (Circle2d)
import Colors
import Dict exposing (Dict)
import Element as El exposing (Color, Element)
import Element.Background as Background
import Element.Border as Border
import Element.Events as Events
import Element.Font as Font
import Element.Input as Input
import Element.Keyed
import Force exposing (Force)
import Geometry.Svg
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
import UndoList as UL exposing (UndoList)
import User exposing (BagId, BagProperties, EdgeId, EdgeProperties, User, VertexId, VertexProperties)
import Vector2d exposing (Vector2d)


main : Program () Model Msg
main =
    Browser.document
        { init =
            always
                ( initialModel User.default
                , Task.perform WindowResize (Task.map getWindowSize Dom.getViewport)
                )
        , view = \model -> { title = "Kite", body = [ view model ] }
        , update = \msg model -> ( update msg model, Cmd.none )
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
    { userUL : UndoList User

    --
    , simulationState : Force.State

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

    --
    , selectedMode : Mode
    , selectedTool : Tool
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
    = Hand HandState
    | Draw DrawState
    | Select SelectState


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


initialModel : User -> Model
initialModel user =
    { userUL = UL.fresh user

    --
    , simulationState = user |> User.simulation

    --
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

    --
    , selectedMode = ListsOfBagsVerticesAndEdges
    , selectedTool = Draw DrawIdle
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
    Point2d.fromCoordinates ( -50, -50 )



--  UPDATE


type Msg
    = NoOp
      --
    | Tick Time.Posix
      --
    | WindowResize { width : Int, height : Int }
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
    | ClickOnLeftMostBarRadioButton Mode
      --
    | ClickOnUndoButton
    | ClickOnRedoButton
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
    | MouseLeaveVertexColorPicker
    | MouseLeaveEdgeColorPicker
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
    | ClickOnBagPlus
    | ClickOnBagTrash
    | MouseOverBagItem BagId
    | MouseOutBagItem BagId
    | ClickOnBagItem BagId
    | ToggleConvexHull BagId
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
    | InputVertexX String
    | InputVertexY String
    | InputVertexRadius Float
    | InputVertexStrength Float
    | InputVertexFixed Bool
    | InputVertexColor Color
      --
    | InputEdgeThickness Float
    | InputEdgeDistance Float
    | InputEdgeStrength Float
    | InputEdgeColor Color


reheatSimulation : Model -> Model
reheatSimulation m =
    if m.vaderIsOn then
        { m | simulationState = Force.reheat m.simulationState }

    else
        m


stopSimulation : Model -> Model
stopSimulation m =
    { m | simulationState = Force.stop m.simulationState }


update : Msg -> Model -> Model
update msg m =
    case msg of
        NoOp ->
            m

        Tick _ ->
            let
                ( newSimulationState, newUser_ ) =
                    m.userUL.present |> User.tick m.simulationState

                newUser =
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
                            newUser_ |> User.setVertexPositions newVertexPositions

                        _ ->
                            newUser_
            in
            { m
                | userUL = m.userUL |> UL.mapPresent (always newUser)
                , simulationState = newSimulationState
            }

        WindowResize wS ->
            { m | windowSize = wS }

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

        ClickOnLeftMostBarRadioButton selectedMode ->
            { m | selectedMode = selectedMode }

        ClickOnUndoButton ->
            { m | userUL = m.userUL |> UL.undo }

        ClickOnRedoButton ->
            { m | userUL = m.userUL |> UL.redo }

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

        ClickOnVader ->
            reheatSimulation
                { m | vaderIsOn = not m.vaderIsOn }

        ClickOnVertexColorPicker ->
            { m | vertexColorPickerIsExpanded = not m.vertexColorPickerIsExpanded }

        ClickOnEdgeColorPicker ->
            { m | edgeColorPickerIsExpanded = not m.edgeColorPickerIsExpanded }

        MouseLeaveVertexColorPicker ->
            { m | vertexColorPickerIsExpanded = False }

        MouseLeaveEdgeColorPicker ->
            { m | edgeColorPickerIsExpanded = False }

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
                                    User.vertexIdsInBoundingBox
                                        (BoundingBox2d.from brushStart m.svgMousePosition)
                                        m.userUL.present
                            in
                            { m
                                | selectedVertices = newSelectedVertices
                                , selectedEdges = m.userUL.present |> User.inducedEdges newSelectedVertices
                            }

                        LineSelector ->
                            let
                                newSelectedEdges =
                                    User.edgeIdsIntersectiongLineSegment
                                        (LineSegment2d.from brushStart m.svgMousePosition)
                                        m.userUL.present
                            in
                            { m
                                | selectedEdges = newSelectedEdges
                                , selectedVertices = User.inducedVertices newSelectedEdges
                            }

                Select (DraggingSelection { brushStart, vertexPositionsAtStart }) ->
                    let
                        delta =
                            Vector2d.from brushStart m.svgMousePosition

                        newVertexPositions =
                            vertexPositionsAtStart
                                |> IntDict.toList
                                |> List.map (Tuple.mapSecond (Point2d.translateBy delta))

                        newUser =
                            m.userUL.present
                                |> User.setVertexPositions newVertexPositions
                    in
                    { m
                        | userUL = m.userUL |> UL.mapPresent (always newUser)
                    }

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

                _ ->
                    m

        MouseMoveForUpdatingSvgPos newMousePosition ->
            let
                panAsVector =
                    m.pan |> Point2d.coordinates |> Vector2d.fromComponents

                newSvgMousePosition =
                    Point2d.fromCoordinates
                        ( toFloat newMousePosition.x - layoutParams.leftStripeWidth - layoutParams.leftBarWidth
                        , toFloat newMousePosition.y - layoutParams.topBarHeight
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

                Hand (Panning _) ->
                    { m | selectedTool = Hand HandIdle }

                _ ->
                    m

        MouseDownOnTransparentInteractionRect ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newUser, sourceId ) =
                            m.userUL.present |> User.addVertex m.svgMousePosition
                    in
                    stopSimulation
                        { m
                            | userUL = m.userUL |> UL.new newUser
                            , selectedTool = Draw (BrushingNewEdgeWithSourceId sourceId)
                        }

                Select SelectIdle ->
                    { m | selectedTool = Select (BrushingForSelection { brushStart = m.svgMousePosition }) }

                _ ->
                    m

        MouseUpOnTransparentInteractionRect ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    let
                        ( userGraphWithAddedVertex, newId ) =
                            m.userUL.present
                                |> User.addVertex m.svgMousePosition

                        newUser =
                            userGraphWithAddedVertex
                                |> User.addEdge ( sourceId, newId )
                    in
                    reheatSimulation
                        { m
                            | userUL = m.userUL |> UL.new newUser
                            , selectedTool = Draw DrawIdle
                        }

                _ ->
                    m

        MouseDownOnMainSvg ->
            { m
                | selectedTool =
                    case m.selectedTool of
                        Hand HandIdle ->
                            Hand
                                (Panning
                                    { mousePositionAtPanStart = m.mousePosition
                                    , panAtStart = m.pan
                                    }
                                )

                        _ ->
                            m.selectedTool
            }

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
                    let
                        ( newUser, newSelectedVertices, newSelectedEdges ) =
                            if Set.member id m.selectedVertices then
                                if m.altIsDown then
                                    m.userUL.present |> User.duplicateSubgraph m.selectedVertices m.selectedEdges

                                else
                                    ( m.userUL.present, m.selectedVertices, m.selectedEdges )

                            else
                                ( m.userUL.present, Set.singleton id, Set.empty )
                    in
                    reheatSimulation
                        { m
                            | userUL = m.userUL |> UL.new newUser
                            , selectedVertices = newSelectedVertices
                            , selectedEdges = newSelectedEdges
                            , selectedTool =
                                Select
                                    (DraggingSelection
                                        { brushStart = m.svgMousePosition
                                        , vertexPositionsAtStart = newUser |> User.getVertexIdsWithPositions newSelectedVertices
                                        }
                                    )
                            , simulationState = m.simulationState |> Force.alphaTarget 0.3
                        }

                _ ->
                    m

        MouseUpOnVertex targetId ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    if sourceId == targetId then
                        reheatSimulation
                            { m | selectedTool = Draw DrawIdle }

                    else
                        let
                            newUser =
                                m.userUL.present |> User.addEdge ( sourceId, targetId )
                        in
                        reheatSimulation
                            { m
                                | userUL = m.userUL |> UL.new newUser
                                , selectedTool = Draw DrawIdle
                            }

                _ ->
                    m

        MouseDownOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newUser, idOfTheNewVertex ) =
                            m.userUL.present
                                |> User.divideEdge m.svgMousePosition ( s, t )
                    in
                    stopSimulation
                        { m
                            | userUL = m.userUL |> UL.new newUser
                            , highlightedEdges = Set.empty
                            , selectedTool = Draw (BrushingNewEdgeWithSourceId idOfTheNewVertex)
                        }

                Select SelectIdle ->
                    let
                        ( newUser, newSelectedVertices, newSelectedEdges ) =
                            if Set.member ( s, t ) m.selectedEdges then
                                if m.altIsDown then
                                    m.userUL.present
                                        |> User.duplicateSubgraph m.selectedVertices m.selectedEdges

                                else
                                    ( m.userUL.present, m.selectedVertices, m.selectedEdges )

                            else
                                ( m.userUL.present
                                , Set.fromList [ s, t ]
                                , Set.singleton ( s, t )
                                )
                    in
                    reheatSimulation
                        { m
                            | userUL = m.userUL |> UL.new newUser
                            , selectedVertices = newSelectedVertices
                            , selectedEdges = newSelectedEdges
                            , selectedTool =
                                Select
                                    (DraggingSelection
                                        { brushStart = m.svgMousePosition
                                        , vertexPositionsAtStart = newUser |> User.getVertexIdsWithPositions newSelectedVertices
                                        }
                                    )
                            , simulationState = m.simulationState |> Force.alphaTarget 0.3
                        }

                _ ->
                    m

        MouseUpOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    let
                        ( newUser_, newId ) =
                            m.userUL.present |> User.divideEdge m.svgMousePosition ( s, t )

                        newUser =
                            newUser_ |> User.addEdge ( sourceId, newId )
                    in
                    reheatSimulation
                        { m
                            | userUL = m.userUL |> UL.new newUser
                            , highlightedEdges = Set.empty
                            , selectedTool = Draw DrawIdle
                        }

                _ ->
                    m

        ToggleConvexHull bagId ->
            let
                updateCH bag =
                    { bag | hasConvexHull = not bag.hasConvexHull }

                newUser =
                    m.userUL.present |> User.updateBag bagId updateCH
            in
            { m | userUL = m.userUL |> UL.new newUser }

        InputVertexX str ->
            let
                newUser =
                    m.userUL.present
                        |> User.setCentroidX m.selectedVertices
                            (str |> String.toFloat |> Maybe.withDefault 0)
            in
            { m | userUL = m.userUL |> UL.new newUser }

        InputVertexY str ->
            let
                newUser =
                    m.userUL.present
                        |> User.setCentroidY m.selectedVertices
                            (str |> String.toFloat |> Maybe.withDefault 0)
            in
            { m | userUL = m.userUL |> UL.new newUser }

        InputVertexColor newColor ->
            let
                updateColor v =
                    { v | color = newColor }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        m.userUL.present
                            |> User.updateDefaultVertexProperties updateColor

                    else
                        m.userUL.present
                            |> User.updateVertices m.selectedVertices updateColor
            in
            { m | userUL = m.userUL |> UL.new newUser }

        InputVertexRadius num ->
            let
                updateRadius v =
                    { v | radius = num }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        m.userUL.present
                            |> User.updateDefaultVertexProperties updateRadius

                    else
                        m.userUL.present
                            |> User.updateVertices m.selectedVertices updateRadius
            in
            { m | userUL = m.userUL |> UL.new newUser }

        InputVertexStrength num ->
            let
                updateStrength v =
                    { v | strength = num }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        m.userUL.present
                            |> User.updateDefaultVertexProperties updateStrength

                    else
                        m.userUL.present
                            |> User.updateVertices m.selectedVertices updateStrength
            in
            reheatSimulation
                { m | userUL = m.userUL |> UL.new newUser }

        InputEdgeColor newColor ->
            let
                updateColor e =
                    { e | color = newColor }

                newUser =
                    if Set.isEmpty m.selectedEdges then
                        m.userUL.present
                            |> User.updateDefaultEdgeProperties updateColor

                    else
                        m.userUL.present
                            |> User.updateEdges m.selectedEdges updateColor
            in
            { m | userUL = m.userUL |> UL.new newUser }

        InputVertexFixed b ->
            let
                updateFixed v =
                    { v | fixed = b }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        m.userUL.present
                            |> User.updateDefaultVertexProperties updateFixed

                    else
                        m.userUL.present
                            |> User.updateVertices m.selectedVertices updateFixed
            in
            reheatSimulation
                { m | userUL = m.userUL |> UL.new newUser }

        InputEdgeThickness num ->
            let
                updateThickness e =
                    { e | thickness = num }

                newUser =
                    if Set.isEmpty m.selectedEdges then
                        m.userUL.present
                            |> User.updateDefaultEdgeProperties updateThickness

                    else
                        m.userUL.present
                            |> User.updateEdges m.selectedEdges updateThickness
            in
            { m | userUL = m.userUL |> UL.new newUser }

        InputEdgeDistance num ->
            let
                updateDistance e =
                    { e | distance = num }

                newUser =
                    if Set.isEmpty m.selectedEdges then
                        m.userUL.present
                            |> User.updateDefaultEdgeProperties updateDistance

                    else
                        m.userUL.present
                            |> User.updateEdges m.selectedEdges updateDistance
            in
            reheatSimulation
                { m | userUL = m.userUL |> UL.new newUser }

        InputEdgeStrength num ->
            let
                updateStrength e =
                    { e | strength = num }

                newUser =
                    if Set.isEmpty m.selectedEdges then
                        m.userUL.present
                            |> User.updateDefaultEdgeProperties updateStrength

                    else
                        m.userUL.present
                            |> User.updateEdges m.selectedEdges updateStrength
            in
            reheatSimulation
                { m | userUL = m.userUL |> UL.new newUser }

        ClickOnVertexTrash ->
            let
                newUser =
                    m.userUL.present |> User.removeVertices m.selectedVertices
            in
            reheatSimulation
                { m
                    | userUL = m.userUL |> UL.new newUser
                    , selectedVertices = Set.empty
                    , highlightedVertices = Set.empty
                    , selectedEdges = Set.empty
                    , highlightedEdges = Set.empty
                }

        ClickOnEdgeTrash ->
            let
                newUser =
                    m.userUL.present |> User.removeEdges m.selectedEdges
            in
            reheatSimulation
                { m
                    | userUL = m.userUL |> UL.new newUser
                    , highlightedEdges = Set.empty
                    , selectedEdges = Set.empty
                }

        ClickOnEdgeContract ->
            case Set.toList m.selectedEdges of
                [ selectedEdge ] ->
                    let
                        newUser =
                            m.userUL.present
                                |> User.contractEdge selectedEdge
                    in
                    reheatSimulation
                        { m
                            | userUL = m.userUL |> UL.new newUser
                            , highlightedEdges = Set.empty
                            , selectedEdges = Set.empty
                        }

                _ ->
                    m

        ClickOnBagTrash ->
            case m.maybeSelectedBag of
                Just bagId ->
                    let
                        newUser =
                            m.userUL.present |> User.removeBag bagId
                    in
                    { m
                        | userUL = m.userUL |> UL.new newUser
                        , maybeSelectedBag = Nothing
                    }

                Nothing ->
                    m

        ClickOnBagPlus ->
            let
                ( newUser, idOfTheNewBag ) =
                    m.userUL.present
                        |> User.addBag m.selectedVertices
            in
            { m
                | userUL = m.userUL |> UL.new newUser
                , maybeSelectedBag = Just idOfTheNewBag
            }

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
            { m | highlightedVertices = m.userUL.present |> User.getVerticesInBag bagId }

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
                        , m.userUL.present |> User.getVerticesInBag bagId
                        )
            in
            { m
                | maybeSelectedBag = newMaybeSelectedBag
                , selectedVertices = newSelectedVertices
                , selectedEdges = Set.empty
            }



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions m =
    Sub.batch
        [ Browser.Events.onResize (\w h -> WindowResize { width = w, height = h })
        , Browser.Events.onMouseMove (Decode.map MouseMove mousePosition)
        , Browser.Events.onMouseMove (Decode.map MouseMoveForUpdatingSvgPos mousePosition)
        , Browser.Events.onMouseUp (Decode.map MouseUp mousePosition)
        , Browser.Events.onKeyDown (Decode.map toKeyDownMsg keyDecoder)
        , Browser.Events.onKeyUp (Decode.map toKeyUpMsg keyDecoder)
        , Browser.Events.onVisibilityChange PageVisibility
        , if Force.isCompleted m.simulationState || not m.vaderIsOn then
            Sub.none

          else
            Browser.Events.onAnimationFrame Tick
        ]


toKeyDownMsg : Key -> Msg
toKeyDownMsg key =
    case key of
        Character 'h' ->
            ClickOnHandTool

        Character 's' ->
            ClickOnSelectTool

        Character 'd' ->
            ClickOnDrawTool

        Character 'f' ->
            ClickOnVader

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
    { minimumTotalWidth = 1000
    , leftStripeWidth = 40
    , leftBarWidth = 260
    , topBarHeight = 54
    , rightBarWidth = 300
    }


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
        , Font.size 12
        , Font.regular
        , Font.family
            [ Font.typeface "-apple-system"
            , Font.typeface "BlinkMacSystemFont"
            , Font.typeface "Segoe UI"
            , Font.typeface "Roboto"
            , Font.typeface "Oxygen"
            , Font.typeface "Ubuntu"
            , Font.typeface "Cantarell"
            , Font.typeface "Fira Sans"
            , Font.typeface "Droid Sans"
            , Font.typeface "Helvetica Neue"
            , Font.sansSerif
            ]
        , El.htmlAttribute (HA.style "-webkit-font-smoothing" "antialiased")
        , El.htmlAttribute (HA.style "user-select" "none")
        ]
    <|
        El.row
            [ El.width (El.fill |> El.minimum layoutParams.minimumTotalWidth)
            , El.height El.fill
            ]
            [ leftStripe m
            , leftBar m
            , El.column [ El.width El.fill, El.height El.fill ] <|
                [ topBar m
                , El.el [ El.width El.fill, El.height El.fill ] <|
                    El.html (mainSvg m)
                ]
            , rightBar m
            ]


leftStripe : Model -> Element Msg
leftStripe m =
    let
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
                ]
                (El.html (Icons.draw40pxWithColor color iconPath))

        radioButtonsForMode =
            El.column
                [ El.alignTop
                , El.spacing 2
                ]
                [ modeButton "Preferences" Preferences Icons.icons.preferencesGear
                , modeButton "Lists of Bags, Vertices and Edges" ListsOfBagsVerticesAndEdges Icons.icons.listOfThree
                , modeButton "Graph Operations" GraphOperations Icons.icons.magicStick
                , modeButton "Graph Queries" GraphQueries Icons.icons.qForQuery
                , modeButton "Graph Generators" GraphGenerators Icons.icons.lightning
                , modeButton "Algorithm Visualizations" AlgorithmVisualizations Icons.icons.algoVizPlay
                , modeButton "Games on Graphs" GamesOnGraphs Icons.icons.chessHorse
                ]

        githubButton =
            El.newTabLink
                [ El.htmlAttribute (HA.title "Source Code")
                , El.alignBottom
                , El.pointer
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

        --, El.scrollbarY
        ]
        [ radioButtonsForMode
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
        , {- TODO: Scrollbar doesn't work. -} El.scrollbarY
        ]
    <|
        case m.selectedMode of
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


leftBarMenu : List (Element Msg) -> Element Msg -> Element Msg
leftBarMenu headerItems content =
    let
        header =
            El.row
                [ Background.color Colors.leftBarHeader
                , El.width El.fill
                , El.padding 8
                , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
                , Border.color Colors.menuBorder
                , Font.medium
                ]
                headerItems
    in
    El.column [ El.width El.fill ]
        [ header, content ]


leftBarHeaderButton title onClickMsg iconPath =
    El.el
        [ El.htmlAttribute (HA.title title)
        , Events.onClick onClickMsg
        , El.alignRight
        , Border.rounded 4
        , El.mouseDown [ Background.color Colors.selectedItem ]
        , El.mouseOver [ Background.color Colors.mouseOveredItem ]
        , El.pointer
        ]
        (El.html (Icons.draw24px iconPath))


leftBarContentForPreferences : Model -> Element Msg
leftBarContentForPreferences m =
    leftBarMenu [ El.text "Preferences (coming soon)" ] El.none


leftBarContentForListsOfBagsVerticesAndEdges : Model -> Element Msg
leftBarContentForListsOfBagsVerticesAndEdges m =
    let
        listOfBags =
            Element.Keyed.column [ El.width El.fill ]
                (m.userUL.present
                    |> User.getBags
                    |> Dict.map bagItemWithKey
                    |> Dict.values
                    |> List.reverse
                )

        bagItemWithKey bagId { hasConvexHull } =
            ( String.fromInt bagId
            , El.row
                [ El.width El.fill
                , El.paddingXY 10 6
                , Background.color <|
                    if Just bagId == m.maybeSelectedBag then
                        Colors.selectedItem

                    else
                        Colors.menuBackground
                , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
                , Border.color Colors.menuBorder
                , Events.onMouseEnter (MouseOverBagItem bagId)
                , Events.onMouseLeave (MouseOutBagItem bagId)
                , Events.onClick (ClickOnBagItem bagId)
                ]
                [ El.text (m.userUL.present |> User.bagElementsInCurlyBraces bagId)

                --, El.el
                --    [ El.alignRight
                --    , Font.bold
                --    , Font.color <|
                --        if hasConvexHull then
                --            Colors.white
                --        else
                --            Colors.icon
                --    , Events.onClick (ToggleConvexHull bagId)
                --    ]
                --    (El.text "C")
                ]
            )

        --
        listOfVertices =
            Element.Keyed.column [ El.width El.fill ]
                (m.userUL.present
                    |> User.getVertices
                    |> List.map vertexItemWithKey
                    |> List.reverse
                )

        vertexItemWithKey { id } =
            ( String.fromInt id
            , El.row
                [ El.width El.fill
                , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
                , Border.color Colors.menuBorder
                , Events.onMouseEnter (MouseOverVertexItem id)
                , Events.onMouseLeave (MouseOutVertexItem id)
                , Events.onClick (ClickOnVertexItem id)
                ]
                [ El.el [ El.paddingXY 10 6 ]
                    (El.text (String.fromInt id))
                , El.el
                    [ El.width (El.px 6)
                    , El.height El.fill
                    , El.alignRight
                    , Background.color <|
                        if Set.member id m.highlightedVertices then
                            Colors.highlightPink

                        else if Set.member id m.selectedVertices then
                            Colors.selectBlue

                        else
                            Colors.menuBackground
                    ]
                    El.none
                ]
            )

        --
        listOfEdges =
            Element.Keyed.column [ El.width El.fill ]
                (m.userUL.present
                    |> User.getEdges
                    |> List.map edgeItemWithKey
                    |> List.reverse
                )

        edgeItemWithKey { from, to } =
            ( String.fromInt from ++ "-" ++ String.fromInt to
            , El.row
                [ El.width El.fill
                , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
                , Border.color Colors.menuBorder
                , Events.onMouseEnter (MouseOverEdgeItem ( from, to ))
                , Events.onMouseLeave (MouseOutEdgeItem ( from, to ))
                , Events.onClick (ClickOnEdgeItem ( from, to ))
                ]
                [ El.el [ El.paddingXY 10 6 ]
                    (El.text (String.fromInt from ++ " → " ++ String.fromInt to))
                , El.el
                    [ El.width (El.px 6)
                    , El.height El.fill
                    , El.alignRight
                    , Background.color <|
                        if Set.member ( from, to ) m.highlightedEdges then
                            Colors.highlightPink

                        else if Set.member ( from, to ) m.selectedEdges then
                            Colors.selectBlue

                        else
                            Colors.menuBackground
                    ]
                    El.none
                ]
            )
    in
    El.column [ El.width El.fill ]
        [ leftBarMenu
            [ El.text "Bags"
            , leftBarHeaderButton "Add New Bag"
                ClickOnBagPlus
                Icons.icons.plus
            , leftBarHeaderButton "Remove Selected Bag"
                ClickOnBagTrash
                Icons.icons.trash
            ]
            listOfBags
        , leftBarMenu
            [ El.text "Vertices"
            , leftBarHeaderButton "Remove Selected Vertices"
                ClickOnVertexTrash
                Icons.icons.trash
            ]
            listOfVertices
        , leftBarMenu
            [ El.text "Edges"
            , leftBarHeaderButton "Remove Selected Edges"
                ClickOnEdgeTrash
                Icons.icons.trash
            ]
            listOfEdges
        ]


leftBarContentForGraphOperations : Model -> Element Msg
leftBarContentForGraphOperations m =
    leftBarMenu [ El.text "Graph Operations (coming soon)" ] <| El.none


leftBarContentForGraphQueries : Model -> Element Msg
leftBarContentForGraphQueries m =
    leftBarMenu [ El.text "Graph Queries (coming soon)" ] <| El.none


leftBarContentForGraphGenerators : Model -> Element Msg
leftBarContentForGraphGenerators m =
    leftBarMenu [ El.text "Graph Generators (coming soon)" ] <| El.none


leftBarContentForAlgorithmVisualizations : Model -> Element Msg
leftBarContentForAlgorithmVisualizations m =
    leftBarMenu [ El.text "Algorithm Visualizations (coming soon)" ] <| El.none


leftBarContentForGamesOnGraphs : Model -> Element Msg
leftBarContentForGamesOnGraphs m =
    leftBarMenu [ El.text "Games on Graphs (coming soon)" ] <| El.none



-- TOP BAR


topBar : Model -> Element Msg
topBar m =
    let
        oneClickButtonGroup buttonList =
            El.row
                [ El.padding 4
                , El.spacing 4
                ]
                buttonList

        oneClickButton title iconPath onClickMsg =
            El.el
                [ Border.width 1
                , Border.rounded 4
                , Border.color Colors.menuBorder
                , El.mouseDown [ Background.color Colors.selectedItem ]
                , El.mouseOver [ Background.color Colors.mouseOveredItem ]
                , Events.onClick onClickMsg
                , El.htmlAttribute (HA.title title)
                , El.pointer
                ]
                (El.html (Icons.draw34px iconPath))

        radioButtonGroup buttonList =
            El.row
                [ Border.width 1
                , Border.color Colors.menuBorder
                , El.padding 4
                , El.spacing 4
                ]
                buttonList

        radioButton title iconPath onClickMsg backgroundColor =
            El.el
                [ Background.color backgroundColor
                , El.mouseDown [ Background.color Colors.selectedItem ]
                , El.mouseOver [ Background.color Colors.mouseOveredItem ]
                , Border.rounded 4
                , Events.onClick onClickMsg
                , El.htmlAttribute (HA.title title)
                , El.pointer
                ]
                (El.html (Icons.draw34px iconPath))
    in
    El.el
        [ Background.color Colors.menuBackground
        , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
        , Border.color Colors.menuBorder
        , El.width El.fill
        , El.height (El.px layoutParams.topBarHeight)
        ]
    <|
        El.row [ El.centerY, El.paddingXY 16 0, El.spacing 16 ]
            [ oneClickButtonGroup
                [ oneClickButton "Undo" Icons.icons.undo ClickOnUndoButton
                , oneClickButton "Redo" Icons.icons.redo ClickOnRedoButton
                ]
            , oneClickButton "Reset Zoom and Pan"
                Icons.icons.resetZoomAndPan
                ClickOnResetZoomAndPanButton
            , radioButtonGroup
                [ radioButton "Hand (H)"
                    Icons.icons.hand
                    ClickOnHandTool
                  <|
                    case m.selectedTool of
                        Hand _ ->
                            Colors.selectedItem

                        _ ->
                            Colors.menuBackground
                , radioButton "Selection (S)"
                    Icons.icons.pointer
                    ClickOnSelectTool
                  <|
                    case m.selectedTool of
                        Select _ ->
                            Colors.selectedItem

                        _ ->
                            Colors.menuBackground
                , radioButton "Draw (D)"
                    Icons.icons.pen
                    ClickOnDrawTool
                  <|
                    case m.selectedTool of
                        Draw _ ->
                            Colors.selectedItem

                        _ ->
                            Colors.menuBackground
                ]
            , radioButtonGroup
                [ radioButton "Force (F)"
                    Icons.icons.vader
                    ClickOnVader
                  <|
                    if m.vaderIsOn then
                        Colors.selectedItem

                    else
                        Colors.menuBackground
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
        ]
        [ selectionType m
        , vertexProperties m
        , edgeProperties m
        ]


subMenu : String -> List (Element Msg) -> Element Msg
subMenu header contentLines =
    let
        headerBar =
            El.el
                [ El.width El.fill
                , Font.medium
                ]
                (El.text header)

        content =
            El.column
                [ El.width El.fill
                , El.paddingXY 20 20
                , El.spacing 8
                ]
                contentLines
    in
    El.column
        [ El.width El.fill
        , El.padding 12
        , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
        , Border.color Colors.menuBorder
        ]
        [ headerBar
        , content
        ]


selectionType : Model -> Element Msg
selectionType m =
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
                , El.pointer
                , Border.rounded 4
                , Events.onClick ClickOnRectSelector
                , El.mouseDown [ Background.color Colors.selectedItem ]
                , El.mouseOver [ Background.color Colors.mouseOveredItem ]
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
                , El.pointer
                , Border.rounded 4
                , Events.onClick ClickOnLineSelector
                , El.mouseDown [ Background.color Colors.selectedItem ]
                , El.mouseOver [ Background.color Colors.mouseOveredItem ]
                ]
                (El.html (Icons.draw24px Icons.icons.selectionLine))
    in
    subMenu "Selector"
        [ El.row [ El.spacing 8 ]
            [ El.el
                [ El.centerY
                , El.width (El.px 60)
                , Font.alignRight
                ]
                (El.text "Type")
            , El.row
                [ El.spacing 4
                , El.padding 4
                , Border.width 1
                , Border.color Colors.menuBorder
                ]
                [ rectSelector
                , lineSelector
                ]
            ]

        --, Input.radioRow []
        --    { onChange = ClickOnSelectorType
        --    , options =
        --        [ Input.option RectSelector rectSelector
        --        , Input.option LineSelector lineSelector
        --        ]
        --    , selected = Just RectSelector
        --    , label = styledLabel "Type"
        --    }
        ]


styledLabel labelText =
    Input.labelLeft
        [ El.centerY
        , El.width (El.px 60)
        , Font.alignRight
        ]
        (El.text labelText)


textInput :
    { labelText : String
    , text : String
    , onChange : String -> Msg
    }
    -> Element Msg
textInput { labelText, text, onChange } =
    Input.text
        [ El.width (El.px 40)
        , El.height (El.px 10)
        , Background.color Colors.inputBackground
        , El.paddingXY 6 10
        , El.spacing 8
        , Font.size 10
        , Border.width 0
        , Border.rounded 2
        , El.focused
            [ Font.color Colors.darkText
            , Background.color Colors.white
            ]
        ]
        { onChange = onChange
        , text = text
        , placeholder = Nothing
        , label = styledLabel labelText
        }


sliderInput :
    { labelText : String
    , value : Float
    , min : Float
    , max : Float
    , step : Float
    , onChange : Float -> Msg
    }
    -> Element Msg
sliderInput { labelText, value, min, max, step, onChange } =
    Input.slider
        [ El.paddingXY 6 10
        , El.spacing 8
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
        , label = styledLabel labelText
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
    , state : Maybe Bool
    , onChange : Bool -> Msg
    }
    -> Element Msg
checkbox { labelText, state, onChange } =
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
        [ El.el
            [ El.centerY
            , El.width (El.px 60)
            , Font.alignRight
            ]
            (El.text labelText)
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
    , isExpanded : Bool
    , selectedColor : Maybe Color
    , msgOnExpanderClick : Msg
    , msgOnColorClick : Color -> Msg
    , msgOnLeave : Msg
    }
    -> Element Msg
colorPicker { labelText, isExpanded, selectedColor, msgOnExpanderClick, msgOnColorClick, msgOnLeave } =
    let
        label =
            El.el
                [ El.centerY
                , El.width (El.px 60)
                , Font.alignRight
                ]
                (El.text labelText)

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
        [ label
        , input
        ]


vertexProperties : Model -> Element Msg
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
    in
    subMenu headerForVertexProperties
        [ El.row []
            [ textInput
                { labelText = "X"
                , text =
                    m.userUL.present
                        |> User.getCentroid m.selectedVertices
                        |> Maybe.map Point2d.xCoordinate
                        |> Maybe.map round
                        |> Maybe.map String.fromInt
                        |> Maybe.withDefault "?"
                , onChange = InputVertexX
                }
            , textInput
                { labelText = "Y"
                , text =
                    m.userUL.present
                        |> User.getCentroid m.selectedVertices
                        |> Maybe.map Point2d.yCoordinate
                        |> Maybe.map round
                        |> Maybe.map String.fromInt
                        |> Maybe.withDefault "?"
                , onChange = InputVertexY
                }
            ]
        , checkbox
            { labelText = "Fixed"
            , state =
                if Set.isEmpty m.selectedVertices then
                    Just
                        (m.userUL.present
                            |> User.getDefaultVertexProperties
                            |> .fixed
                        )

                else
                    m.userUL.present |> User.getCommonVertexProperty m.selectedVertices .fixed
            , onChange = InputVertexFixed
            }
        , sliderInput
            { labelText = "Radius"
            , value =
                if Set.isEmpty m.selectedVertices then
                    m.userUL.present
                        |> User.getDefaultVertexProperties
                        |> .radius

                else
                    case m.userUL.present |> User.getCommonVertexProperty m.selectedVertices .radius of
                        Just r ->
                            r

                        Nothing ->
                            5
            , min = 4
            , max = 20
            , step = 1
            , onChange = InputVertexRadius
            }
        , sliderInput
            { labelText = "Strength"
            , value =
                let
                    defaultVertexStrength =
                        m.userUL.present
                            |> User.getDefaultVertexProperties
                            |> .strength
                in
                if Set.isEmpty m.selectedVertices then
                    defaultVertexStrength

                else
                    m.userUL.present
                        |> User.getCommonVertexProperty m.selectedVertices .strength
                        |> Maybe.withDefault defaultVertexStrength
            , min = -2000
            , max = 0
            , step = 40
            , onChange = InputVertexStrength
            }
        , colorPicker
            { labelText = "Color"
            , isExpanded = m.vertexColorPickerIsExpanded
            , selectedColor =
                if Set.isEmpty m.selectedVertices then
                    Just
                        (m.userUL.present
                            |> User.getDefaultVertexProperties
                            |> .color
                        )

                else
                    m.userUL.present
                        |> User.getCommonVertexProperty m.selectedVertices .color
            , msgOnColorClick = InputVertexColor
            , msgOnExpanderClick = ClickOnVertexColorPicker
            , msgOnLeave = MouseLeaveVertexColorPicker
            }
        ]


edgeProperties : Model -> Element Msg
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
    in
    subMenu headerForEdgeProperties
        [ sliderInput
            { labelText = "Thickness"
            , value =
                if Set.isEmpty m.selectedEdges then
                    m.userUL.present
                        |> User.getDefaultEdgeProperties
                        |> .thickness

                else
                    m.userUL.present
                        |> User.getCommonEdgeProperty m.selectedEdges .thickness
                        |> Maybe.withDefault 3
            , min = 1
            , max = 20
            , step = 1
            , onChange = InputEdgeThickness
            }
        , sliderInput
            { labelText = "Distance"
            , value =
                if Set.isEmpty m.selectedEdges then
                    m.userUL.present
                        |> User.getDefaultEdgeProperties
                        |> .distance

                else
                    m.userUL.present
                        |> User.getCommonEdgeProperty m.selectedEdges .distance
                        |> Maybe.withDefault 40
            , min = 10
            , max = 200
            , step = 10
            , onChange = InputEdgeDistance
            }
        , sliderInput
            { labelText = "Strength"
            , value =
                if Set.isEmpty m.selectedEdges then
                    m.userUL.present
                        |> User.getDefaultEdgeProperties
                        |> .strength

                else
                    m.userUL.present
                        |> User.getCommonEdgeProperty m.selectedEdges .strength
                        |> Maybe.withDefault 0.7
            , min = 0
            , max = 1
            , step = 0.05
            , onChange = InputEdgeStrength
            }
        , colorPicker
            { labelText = "Color"
            , isExpanded = m.edgeColorPickerIsExpanded
            , selectedColor =
                if Set.isEmpty m.selectedEdges then
                    Just
                        (m.userUL.present
                            |> User.getDefaultEdgeProperties
                            |> .color
                        )

                else
                    m.userUL.present
                        |> User.getCommonEdgeProperty m.selectedEdges .color
            , msgOnColorClick = InputEdgeColor
            , msgOnExpanderClick = ClickOnEdgeColorPicker
            , msgOnLeave = MouseLeaveEdgeColorPicker
            }
        ]



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
                    case m.userUL.present |> User.getVertexProperties sourceId of
                        Just { position } ->
                            let
                                dEP =
                                    m.userUL.present |> User.getDefaultEdgeProperties
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
                            m.userUL.present
                                |> User.getBoundingBoxWithMargin selectedVertices
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
                (m.userUL.present
                    |> User.getVertices
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
                (m.userUL.present
                    |> User.getVertices
                    |> List.filter (\{ id } -> Set.member id m.highlightedVertices)
                    |> List.map (.label >> drawHL)
                )

        maybeHighlightsOnSelectedEdges =
            let
                drawHL { from, to, label } =
                    case
                        ( m.userUL.present |> User.getVertexProperties from
                        , m.userUL.present |> User.getVertexProperties to
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
                (m.userUL.present
                    |> User.getEdges
                    |> List.filter (\{ from, to } -> Set.member ( from, to ) m.selectedEdges)
                    |> List.map drawHL
                )

        maybeHighlightOnMouseOveredEdges =
            let
                drawHL { from, to, label } =
                    case
                        ( m.userUL.present |> User.getVertexProperties from
                        , m.userUL.present |> User.getVertexProperties to
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
                (m.userUL.present
                    |> User.getEdges
                    |> List.filter (\{ from, to } -> Set.member ( from, to ) m.highlightedEdges)
                    |> List.map drawHL
                )

        cursor =
            case m.selectedTool of
                Hand HandIdle ->
                    "grab"

                Hand (Panning _) ->
                    "grabbing"

                Draw _ ->
                    "crosshair"

                Select _ ->
                    "default"

        mainSvgWidth =
            max m.windowSize.width layoutParams.minimumTotalWidth
                - layoutParams.leftStripeWidth
                - layoutParams.leftBarWidth
                - layoutParams.rightBarWidth

        mainSvgHeight =
            m.windowSize.height - layoutParams.topBarHeight

        fromPanAndZoom pan zoom =
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
        , SA.viewBox (fromPanAndZoom m.pan m.zoom)
        , SE.onMouseDown MouseDownOnMainSvg
        , HE.on "wheel" (Decode.map WheelDeltaY wheelDeltaY)
        ]
        [ pageA4WithRuler
        , viewHulls m.userUL.present
        , maybeBrushedEdge
        , transparentInteractionRect
        , maybeHighlightsOnSelectedEdges
        , maybeHighlightOnMouseOveredEdges
        , maybeHighlightsOnSelectedVertices
        , maybeHighlightOnMouseOveredVertices
        , viewEdges m.userUL.present
        , viewVertices m.userUL.present
        , maybeBrushedSelector
        , maybeRectAroundSelectedVertices
        ]



-- GRAPH VIEW


viewEdges : User -> Html Msg
viewEdges user =
    let
        edgeWithKey { from, to, label } =
            case ( User.getVertexProperties from user, User.getVertexProperties to user ) of
                ( Just v, Just w ) ->
                    ( String.fromInt from ++ "-" ++ String.fromInt to
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
                            (LineSegment2d.from v.position w.position)
                        , Geometry.Svg.lineSegment2d
                            [ SA.stroke (Colors.toString label.color)
                            , SA.strokeWidth (String.fromFloat label.thickness)
                            ]
                            (LineSegment2d.from v.position w.position)
                        ]
                    )

                _ ->
                    -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE" <|
                    ( "", emptySvgElement )
    in
    Svg.Keyed.node "g" [] (user |> User.getEdges |> List.map edgeWithKey)


viewVertices : User -> Html Msg
viewVertices user =
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

        vertexWithKey { id, label } =
            let
                { position, color, radius, fixed } =
                    label

                ( x, y ) =
                    Point2d.coordinates position
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
                ]
            )
    in
    Svg.Keyed.node "g" [] (user |> User.getVertices |> List.map vertexWithKey)


viewHulls : User -> Html Msg
viewHulls user =
    let
        hull : List Point2d -> Html a
        hull positions =
            Geometry.Svg.polygon2d
                [ SA.fill "lightGray"
                , SA.opacity "0.3"
                , SA.stroke "lightGray"
                , SA.strokeWidth "50"
                , SA.strokeLinejoin "round"
                ]
                (Polygon2d.convexHull positions)

        hulls =
            user
                |> User.getBagsWithVertices
                |> Dict.filter (\_ ( bP, _ ) -> bP.hasConvexHull)
                |> Dict.values
                |> List.map (\( _, l ) -> hull (l |> List.map (Tuple.second >> .position)))
    in
    S.g [] hulls
