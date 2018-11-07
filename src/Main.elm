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
    { userUL : UndoList ( String, User )

    --
    , simulationState : Force.State

    --
    , timeList : List Time.Posix
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
    { userUL = UL.fresh ( "Started with empty graph", user )

    --
    , simulationState = user |> User.simulation

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
    | InputBagConvexHull BagId Bool
      --
    | InputVertexX String
    | InputVertexY String
    | InputVertexRadius Float
    | InputVertexStrength Float
    | InputVertexFixed Bool
    | InputVertexLabelVisibility Bool
    | InputVertexLabel String
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


presentUser : Model -> User
presentUser m =
    Tuple.second m.userUL.present


nwUsr : User -> String -> Model -> Model
nwUsr newUser description m =
    { m | userUL = m.userUL |> UL.new ( description, newUser ) }


update : Msg -> Model -> Model
update msg m =
    case msg of
        NoOp ->
            m

        Tick t ->
            let
                ( newSimulationState, newUser_ ) =
                    presentUser m |> User.tick m.simulationState

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
                | userUL = m.userUL |> UL.mapPresent (Tuple.mapSecond (always newUser))
                , simulationState = newSimulationState
                , timeList = t :: m.timeList |> List.take 42
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
            reheatSimulation
                { m | userUL = m.userUL |> UL.undo }

        ClickOnRedoButton ->
            reheatSimulation
                { m | userUL = m.userUL |> UL.redo }

        ClickOnHistoryItem i ->
            reheatSimulation
                { m | userUL = m.userUL |> UL.goTo i }

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
                                        (presentUser m)
                            in
                            { m
                                | selectedVertices = newSelectedVertices
                                , selectedEdges = presentUser m |> User.inducedEdges newSelectedVertices
                            }

                        LineSelector ->
                            let
                                newSelectedEdges =
                                    User.edgeIdsIntersectiongLineSegment
                                        (LineSegment2d.from brushStart m.svgMousePosition)
                                        (presentUser m)
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
                            presentUser m
                                |> User.setVertexPositions newVertexPositions
                    in
                    { m
                        | userUL = m.userUL |> UL.mapPresent (Tuple.mapSecond (always newUser))
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
                        |> nwUsr (presentUser m)
                            "Moved vertices"

                Hand (Panning _) ->
                    { m | selectedTool = Hand HandIdle }

                _ ->
                    m

        MouseDownOnTransparentInteractionRect ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newUser, sourceId ) =
                            presentUser m |> User.addVertex m.svgMousePosition
                    in
                    { m
                        | selectedTool = Draw (BrushingNewEdgeWithSourceId sourceId)
                    }
                        |> stopSimulation
                        |> nwUsr newUser
                            ("Added vertex " ++ vertexIdToString sourceId)

                Select SelectIdle ->
                    { m | selectedTool = Select (BrushingForSelection { brushStart = m.svgMousePosition }) }

                _ ->
                    m

        MouseUpOnTransparentInteractionRect ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    let
                        ( userGraphWithAddedVertex, newId ) =
                            presentUser m
                                |> User.addVertex m.svgMousePosition

                        newUser =
                            userGraphWithAddedVertex
                                |> User.addEdge ( sourceId, newId )
                    in
                    { m | selectedTool = Draw DrawIdle }
                        |> reheatSimulation
                        |> nwUsr newUser
                            ("Added vertex "
                                ++ vertexIdToString newId
                                ++ " and edge "
                                ++ edgeIdToString ( sourceId, newId )
                            )

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
                                    presentUser m
                                        |> User.duplicateSubgraph m.selectedVertices m.selectedEdges

                                else
                                    ( presentUser m
                                    , m.selectedVertices
                                    , m.selectedEdges
                                    )

                            else
                                ( presentUser m
                                , Set.singleton id
                                , Set.empty
                                )
                    in
                    { m
                        | selectedVertices = newSelectedVertices
                        , selectedEdges = newSelectedEdges
                        , selectedTool =
                            Select
                                (DraggingSelection
                                    { brushStart = m.svgMousePosition
                                    , vertexPositionsAtStart =
                                        newUser
                                            |> User.getVertexIdsWithPositions newSelectedVertices
                                    }
                                )
                        , simulationState = m.simulationState |> Force.alphaTarget 0.3
                    }
                        |> reheatSimulation
                        |> nwUsr newUser "TODO"

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
                            newUser =
                                presentUser m
                                    |> User.addEdge ( sourceId, targetId )
                        in
                        { m | selectedTool = Draw DrawIdle }
                            |> reheatSimulation
                            |> nwUsr newUser
                                ("Added edge "
                                    ++ edgeIdToString ( sourceId, targetId )
                                )

                _ ->
                    m

        MouseDownOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newUser, newId ) =
                            presentUser m
                                |> User.divideEdge m.svgMousePosition ( s, t )
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedTool = Draw (BrushingNewEdgeWithSourceId newId)
                    }
                        |> stopSimulation
                        |> nwUsr newUser
                            ("Divided Edge "
                                ++ edgeIdToString ( s, t )
                                ++ " by vertex "
                                ++ vertexIdToString newId
                            )

                Select SelectIdle ->
                    let
                        ( newUser, newSelectedVertices, newSelectedEdges ) =
                            if Set.member ( s, t ) m.selectedEdges then
                                if m.altIsDown then
                                    presentUser m
                                        |> User.duplicateSubgraph m.selectedVertices m.selectedEdges

                                else
                                    ( presentUser m
                                    , m.selectedVertices
                                    , m.selectedEdges
                                    )

                            else
                                ( presentUser m
                                , Set.fromList [ s, t ]
                                , Set.singleton ( s, t )
                                )
                    in
                    { m
                        | selectedVertices = newSelectedVertices
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
                        |> reheatSimulation
                        |> nwUsr newUser "TODO"

                _ ->
                    m

        MouseUpOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw (BrushingNewEdgeWithSourceId sourceId) ->
                    let
                        ( newUser_, newId ) =
                            presentUser m
                                |> User.divideEdge m.svgMousePosition ( s, t )

                        newUser =
                            newUser_ |> User.addEdge ( sourceId, newId )
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedTool = Draw DrawIdle
                    }
                        |> reheatSimulation
                        |> nwUsr newUser
                            ("Divided Edge "
                                ++ edgeIdToString ( s, t )
                                ++ " by adding vertex "
                                ++ vertexIdToString newId
                                ++ " and added edge "
                                ++ edgeIdToString ( sourceId, newId )
                            )

                _ ->
                    m

        InputBagConvexHull bagId b ->
            let
                updateCH bag =
                    { bag | hasConvexHull = b }

                newUser =
                    presentUser m |> User.updateBag bagId updateCH
            in
            m
                |> nwUsr newUser
                    ("Toggled convex hull of the bag " ++ bagIdToString bagId)

        InputVertexX str ->
            let
                newUser =
                    presentUser m
                        |> User.setCentroidX m.selectedVertices
                            (str |> String.toFloat |> Maybe.withDefault 0)
            in
            m
                |> nwUsr newUser
                    ("Changed the X coordinate of vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                    )

        InputVertexY str ->
            let
                newUser =
                    presentUser m
                        |> User.setCentroidY m.selectedVertices
                            (str |> String.toFloat |> Maybe.withDefault 0)
            in
            m
                |> nwUsr newUser
                    ("Changed the Y coordinate of vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                    )

        InputVertexColor newColor ->
            let
                updateColor v =
                    { v | color = newColor }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        presentUser m
                            |> User.updateDefaultVertexProperties updateColor

                    else
                        presentUser m
                            |> User.updateVertices m.selectedVertices updateColor
            in
            m
                |> nwUsr newUser
                    ("Changed the color of the vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                        ++ " to "
                        ++ Colors.toString newColor
                    )

        InputVertexRadius num ->
            let
                updateRadius v =
                    { v | radius = num }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        presentUser m
                            |> User.updateDefaultVertexProperties updateRadius

                    else
                        presentUser m
                            |> User.updateVertices m.selectedVertices updateRadius
            in
            m
                |> nwUsr newUser
                    ("Changed the radius of the vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                        ++ " to "
                        ++ String.fromFloat num
                    )

        InputVertexStrength num ->
            let
                updateStrength v =
                    { v | strength = num }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        presentUser m
                            |> User.updateDefaultVertexProperties updateStrength

                    else
                        presentUser m
                            |> User.updateVertices m.selectedVertices updateStrength
            in
            m
                |> reheatSimulation
                |> nwUsr newUser
                    ("Changed the strength of the vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                        ++ " to "
                        ++ String.fromFloat num
                    )

        InputVertexLabel str ->
            let
                updateLabel v =
                    { v | label = Just str }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        presentUser m
                            |> User.updateDefaultVertexProperties updateLabel

                    else
                        presentUser m
                            |> User.updateVertices m.selectedVertices updateLabel
            in
            m
                |> nwUsr newUser
                    ("Changed the label of the vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                        ++ " to '"
                        ++ str
                        ++ "'"
                    )

        InputVertexFixed b ->
            let
                updateFixed v =
                    { v | fixed = b }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        presentUser m
                            |> User.updateDefaultVertexProperties updateFixed

                    else
                        presentUser m
                            |> User.updateVertices m.selectedVertices updateFixed

                descriptionStart =
                    if b then
                        "Fixed vertices "

                    else
                        "Released vertices "
            in
            m
                |> reheatSimulation
                |> nwUsr newUser
                    (descriptionStart
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                    )

        InputVertexLabelVisibility b ->
            let
                updateLabelVisibility v =
                    { v | labelIsVisible = b }

                newUser =
                    if Set.isEmpty m.selectedVertices then
                        presentUser m
                            |> User.updateDefaultVertexProperties updateLabelVisibility

                    else
                        presentUser m
                            |> User.updateVertices m.selectedVertices updateLabelVisibility

                descriptionEnd =
                    if b then
                        " visible"

                    else
                        " invisible"
            in
            m
                |> nwUsr newUser
                    ("Made the labels of the vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                        ++ descriptionEnd
                    )

        InputEdgeColor newColor ->
            let
                updateColor e =
                    { e | color = newColor }

                newUser =
                    if Set.isEmpty m.selectedEdges then
                        presentUser m
                            |> User.updateDefaultEdgeProperties updateColor

                    else
                        presentUser m
                            |> User.updateEdges m.selectedEdges updateColor
            in
            m
                |> nwUsr newUser
                    ("Changed the color of the vertices "
                        ++ edgeIdsToString (Set.toList m.selectedEdges)
                        ++ " to "
                        ++ Colors.toString newColor
                    )

        InputEdgeThickness num ->
            let
                updateThickness e =
                    { e | thickness = num }

                newUser =
                    if Set.isEmpty m.selectedEdges then
                        presentUser m
                            |> User.updateDefaultEdgeProperties updateThickness

                    else
                        presentUser m
                            |> User.updateEdges m.selectedEdges updateThickness
            in
            m
                |> nwUsr newUser
                    ("Changed the thickness of the edges "
                        ++ edgeIdsToString (Set.toList m.selectedEdges)
                        ++ " to "
                        ++ String.fromFloat num
                    )

        InputEdgeDistance num ->
            let
                updateDistance e =
                    { e | distance = num }

                newUser =
                    if Set.isEmpty m.selectedEdges then
                        presentUser m
                            |> User.updateDefaultEdgeProperties updateDistance

                    else
                        presentUser m
                            |> User.updateEdges m.selectedEdges updateDistance
            in
            m
                |> reheatSimulation
                |> nwUsr newUser
                    ("Changed the distance of the edges "
                        ++ edgeIdsToString (Set.toList m.selectedEdges)
                        ++ " to "
                        ++ String.fromFloat num
                    )

        InputEdgeStrength num ->
            let
                updateStrength e =
                    { e | strength = num }

                newUser =
                    if Set.isEmpty m.selectedEdges then
                        presentUser m
                            |> User.updateDefaultEdgeProperties updateStrength

                    else
                        presentUser m
                            |> User.updateEdges m.selectedEdges updateStrength
            in
            m
                |> reheatSimulation
                |> nwUsr newUser
                    ("Changed the strength of the edges "
                        ++ edgeIdsToString (Set.toList m.selectedEdges)
                        ++ " to "
                        ++ String.fromFloat num
                    )

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
                newUser =
                    presentUser m |> User.removeVertices m.selectedVertices
            in
            { m
                | selectedVertices = Set.empty
                , highlightedVertices = Set.empty
                , selectedEdges = Set.empty
                , highlightedEdges = Set.empty
            }
                |> reheatSimulation
                |> nwUsr newUser
                    ("Removed vertices "
                        ++ vertexIdsToString (Set.toList m.selectedVertices)
                    )

        ClickOnBagPlus ->
            let
                ( newUser, idOfTheNewBag ) =
                    presentUser m |> User.addBag m.selectedVertices
            in
            { m | maybeSelectedBag = Just idOfTheNewBag }
                |> nwUsr newUser
                    ("Added bag " ++ bagIdToString idOfTheNewBag)

        ClickOnBagTrash ->
            case m.maybeSelectedBag of
                Just bagId ->
                    let
                        newUser =
                            presentUser m |> User.removeBag bagId
                    in
                    { m | maybeSelectedBag = Nothing }
                        |> reheatSimulation
                        |> nwUsr newUser
                            ("Removed bag " ++ bagIdToString bagId)

                Nothing ->
                    m

        ClickOnEdgeTrash ->
            let
                newUser =
                    presentUser m |> User.removeEdges m.selectedEdges
            in
            { m
                | highlightedEdges = Set.empty
                , selectedEdges = Set.empty
            }
                |> reheatSimulation
                |> nwUsr newUser
                    ("Removed edges "
                        ++ edgeIdsToString (Set.toList m.selectedEdges)
                    )

        ClickOnEdgeContract ->
            case Set.toList m.selectedEdges of
                [ selectedEdge ] ->
                    let
                        newUser =
                            presentUser m |> User.contractEdge selectedEdge
                    in
                    { m
                        | highlightedEdges = Set.empty
                        , selectedEdges = Set.empty
                    }
                        |> reheatSimulation
                        |> nwUsr newUser
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
            { m | highlightedVertices = presentUser m |> User.getVerticesInBag bagId }

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
                        , presentUser m |> User.getVerticesInBag bagId
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
                , El.column
                    []
                    [ El.el [ El.width El.fill, El.height El.fill ] <|
                        El.html (mainSvg m)
                    , debugView m
                    ]
                ]
            , rightBar m
            ]


debugView : Model -> Element Msg
debugView m =
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
        [ El.width El.fill
        , El.padding 10
        , Font.size 10
        , Background.color Colors.mainSvgBackground
        ]
    <|
        [ El.el [ El.width (El.px 20) ] <| El.text (String.fromInt (round fps))
        , El.el [ El.width (El.px 40) ] <| El.text "fps"
        , El.el [] <|
            El.html <|
                S.svg [ SA.height "10px" ]
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
        , El.paddingXY 0 2
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
        , Border.rounded 4
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
        , Border.widthEach { top = 0, right = 0, bottom = 2, left = 1 }
        , Border.color Colors.menuBorder
        , Font.medium
        , Font.center
        ]
        (El.text headerText)


leftBarContentForListsOfBagsVerticesAndEdges : Model -> Element Msg
leftBarContentForListsOfBagsVerticesAndEdges m =
    let
        tableOfVertices =
            let
                cell id content =
                    El.el
                        [ El.padding 2
                        , El.width El.fill
                        , El.height El.fill
                        , Font.center
                        , Border.widthEach { top = 0, right = 0, bottom = 1, left = 1 }
                        , Border.color Colors.menuBorder
                        , Events.onMouseEnter (MouseOverVertexItem id)
                        , Events.onMouseLeave (MouseOutVertexItem id)
                        , Events.onClick (ClickOnVertexItem id)
                        ]
                        content
            in
            El.table
                [ El.width El.fill
                , El.height (El.fill |> El.maximum 300)
                , El.scrollbarY
                ]
                { data = User.getVertices (presentUser m)
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
                                    El.text (String.fromFloat label.strength)
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
        listOfEdges =
            Element.Keyed.column [ El.width El.fill ]
                (presentUser m
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
                    (El.text (edgeIdToString ( from, to )))
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
            , contentItems = [ listOfEdges ]
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
    menu
        { headerText = "Graph Generators (coming soon)"
        , isOn = True
        , headerButtons = []
        , toggleMsg = NoOp
        , contentItems = []
        }


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
    El.row [ El.spacing 4 ] buttonList


oneClickButton :
    { title : String
    , iconPath : String
    , onClickMsg : Msg
    , disabled : Bool
    }
    -> Element Msg
oneClickButton { title, iconPath, onClickMsg, disabled } =
    let
        attributes =
            if disabled then
                [ Border.width 1
                , Border.rounded 4
                , Border.color Colors.menuBorder
                , El.alpha 0.1
                ]

            else
                [ Border.width 1
                , Border.rounded 4
                , Border.color Colors.menuBorder
                , El.pointer
                , El.mouseDown [ Background.color Colors.selectedItem ]
                , El.mouseOver [ Background.color Colors.mouseOveredItem ]
                , Events.onClick onClickMsg
                , El.htmlAttribute (HA.title title)
                ]
    in
    El.el attributes (El.html (Icons.draw34px iconPath))


radioButtonGroup : List (Element Msg) -> Element Msg
radioButtonGroup buttonList =
    El.row
        [ Border.width 1
        , Border.color Colors.menuBorder
        , Border.rounded 26
        , El.padding 4
        , El.spacing 4
        , El.mouseOver
            [ Border.color Colors.menuBorderOnMouseOver
            ]
        ]
        buttonList


radioButton :
    { title : String
    , iconPath : String
    , onClickMsg : Msg
    , isSelected : Bool
    }
    -> Element Msg
radioButton { title, iconPath, onClickMsg, isSelected } =
    El.el
        [ Background.color <|
            if isSelected then
                Colors.selectedItem

            else
                Colors.menuBackground
        , El.mouseDown [ Background.color Colors.selectedItem ]
        , El.mouseOver [ Background.color Colors.mouseOveredItem ]
        , Border.rounded 20
        , El.htmlAttribute (HA.title title)
        , Events.onClick onClickMsg
        , El.pointer
        ]
        (El.html (Icons.draw34px iconPath))


topBar : Model -> Element Msg
topBar m =
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
                [ oneClickButton
                    { title = "Undo"
                    , iconPath = Icons.icons.undo
                    , onClickMsg = ClickOnUndoButton
                    , disabled = not (m.userUL |> UL.hasPast)
                    }
                , oneClickButton
                    { title = "Redo"
                    , iconPath = Icons.icons.redo
                    , onClickMsg = ClickOnRedoButton
                    , disabled = not (m.userUL |> UL.hasFuture)
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
                    , isSelected =
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
                    , isSelected =
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
                    , isSelected =
                        case m.selectedTool of
                            Draw _ ->
                                True

                            _ ->
                                False
                    }
                ]
            , oneClickButtonGroup
                [ radioButtonGroup
                    [ radioButton
                        { title = "Force (F)"
                        , iconPath = Icons.icons.vader
                        , onClickMsg = ClickOnVader
                        , isSelected = m.vaderIsOn
                        }
                    ]
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
        attributes_ i =
            [ Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
            , Border.color Colors.menuBorder
            , El.width El.fill
            , El.paddingXY 10 4
            , Events.onClick (ClickOnHistoryItem i)
            , El.pointer
            ]

        attributes i =
            if i <= UL.lengthPast m.userUL then
                attributes_ i

            else
                El.alpha 0.3 :: attributes_ i

        item i ( descriptionText, _ ) =
            El.el (attributes i) (El.text descriptionText)

        itemList =
            m.userUL
                |> UL.toList
                |> List.indexedMap item

        content =
            El.column
                [ El.width El.fill
                , El.height (El.px 100)
                , El.scrollbarY
                ]
                (List.reverse itemList)
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
                , El.pointer
                , Border.rounded 12
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
                , Border.rounded 12
                , Events.onClick ClickOnLineSelector
                , El.mouseDown [ Background.color Colors.selectedItem ]
                , El.mouseOver [ Background.color Colors.mouseOveredItem ]
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
                    [ El.spacing 1
                    , El.padding 1
                    , Border.rounded 16
                    , Border.width 1
                    , Border.color Colors.menuBorder
                    , El.mouseOver [ Border.color Colors.menuBorderOnMouseOver ]
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
                        [ El.padding 2
                        , El.width El.fill
                        , El.height El.fill
                        , Border.widthEach { top = 0, right = 0, bottom = 1, left = 1 }
                        , Border.color Colors.menuBorder
                        , Background.color <|
                            if Just bagId == m.maybeSelectedBag then
                                Colors.selectedItem

                            else
                                Colors.menuBackground
                        , Events.onMouseEnter (MouseOverBagItem bagId)
                        , Events.onMouseLeave (MouseOutBagItem bagId)
                        , Events.onClick (ClickOnBagItem bagId)
                        , El.scrollbarX
                        , Font.center
                        ]
                        content
            in
            El.table
                [ El.width El.fill
                , El.height (El.fill |> El.maximum 105)
                , El.scrollbarY
                ]
                { data = User.getBags (presentUser m)
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
                                        (presentUser m
                                            |> User.getVerticesInBag bagId
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
                    , { header = columnHeader "Pull Center"
                      , width = El.fill
                      , view =
                            \{ bagId, bagProperties } ->
                                cell bagId <|
                                    El.text
                                        (pointToString bagProperties.pullCenter)
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
                    , { header = columnHeader "Str"
                      , width = El.px 30
                      , view =
                            \{ bagId, bagProperties } ->
                                cell bagId <|
                                    El.text (String.fromFloat bagProperties.pullStrength)
                      }
                    ]
                }

        maybeBagPreferences =
            case m.maybeSelectedBag of
                Nothing ->
                    []

                Just idOfTheSelectedBag ->
                    [ --    El.row []
                      --    [ textInput
                      --        { labelText = "Label"
                      --        , labelWidth = 80
                      --        , inputWidth = 60
                      --        , text = {- TODO -} ""
                      --        , onChange = {- TODO -} InputVertexLabel
                      --        }
                      --    , checkbox
                      --        { labelText = "Show Label"
                      --        , labelWidth = 70
                      --        , state = {- TODO -} Nothing
                      --        , onChange = {- TODO -} InputVertexLabelVisibility
                      --        }
                      --    ]
                      --,
                      El.row []
                        [ --colorPicker
                          --        { labelText = "Color"
                          --        , labelWidth = 80
                          --        , isExpanded = m.vertexColorPickerIsExpanded
                          --        , selectedColor =
                          --            if Set.isEmpty m.selectedVertices then
                          --                Just
                          --                    (presentUser m
                          --                        |> User.getDefaultVertexProperties
                          --                        |> .color
                          --                    )
                          --            else
                          --                presentUser m
                          --                    |> User.getCommonVertexProperty m.selectedVertices .color
                          --        , msgOnColorClick = InputVertexColor
                          --        , msgOnExpanderClick = ClickOnVertexColorPicker
                          --        , msgOnLeave = MouseLeaveVertexColorPicker
                          --        }
                          --,
                          checkbox
                            { labelText = "Convex Hull"
                            , labelWidth = 80
                            , state =
                                presentUser m
                                    |> User.getBagProperties idOfTheSelectedBag
                                    |> Maybe.map .hasConvexHull
                            , onChange = InputBagConvexHull idOfTheSelectedBag
                            }
                        ]

                    --, El.row []
                    --    [ checkbox
                    --        { labelText = "Pull Center"
                    --        , labelWidth = 80
                    --        , state = {- TODO -} Nothing
                    --        , onChange = {- TODO -} InputVertexLabelVisibility
                    --        }
                    --    , El.el [ El.paddingXY 20 0 ] <|
                    --        El.text <|
                    --            case
                    --                presentUser m
                    --                    |> User.getBagProperties idOfTheSelectedBag
                    --                    |> Maybe.map .pullCenter
                    --            of
                    --                Just pC ->
                    --                    pC |> pointToString
                    --                Nothing ->
                    --                    ""
                    --    ]
                    --, sliderInput
                    --    { labelText = "Pull Strength"
                    --    , labelWidth = 80
                    --    , value =
                    --        let
                    --            defaultVertexStrength =
                    --                presentUser m
                    --                    |> User.getDefaultVertexProperties
                    --                    |> .strength
                    --        in
                    --        if Set.isEmpty m.selectedVertices then
                    --            defaultVertexStrength
                    --        else
                    --            presentUser m
                    --                |> User.getCommonVertexProperty m.selectedVertices .strength
                    --                |> Maybe.withDefault defaultVertexStrength
                    --    , min = -2000
                    --    , max = 0
                    --    , step = 40
                    --    , onChange = InputVertexStrength
                    --    }
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
        , contentItems = tableOfBags :: maybeBagPreferences
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
                            presentUser m
                                |> User.getDefaultVertexProperties
                                |> .label
                                |> Maybe.withDefault ""

                        else
                            case presentUser m |> User.getCommonVertexProperty m.selectedVertices .label of
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
                                (presentUser m
                                    |> User.getDefaultVertexProperties
                                    |> .labelIsVisible
                                )

                        else
                            presentUser m
                                |> User.getCommonVertexProperty m.selectedVertices .labelIsVisible
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
                                (presentUser m
                                    |> User.getDefaultVertexProperties
                                    |> .fixed
                                )

                        else
                            presentUser m
                                |> User.getCommonVertexProperty m.selectedVertices .fixed
                    , onChange = InputVertexFixed
                    }
                , textInput
                    { labelText = "X"
                    , labelWidth = 20
                    , inputWidth = 40
                    , text =
                        presentUser m
                            |> User.getCentroid m.selectedVertices
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
                        presentUser m
                            |> User.getCentroid m.selectedVertices
                            |> Maybe.map Point2d.yCoordinate
                            |> Maybe.map round
                            |> Maybe.map String.fromInt
                            |> Maybe.withDefault "?"
                    , onChange = InputVertexY
                    }
                ]
            , sliderInput
                { labelText = "Strength"
                , labelWidth = 80
                , value =
                    let
                        defaultVertexStrength =
                            presentUser m
                                |> User.getDefaultVertexProperties
                                |> .strength
                    in
                    if Set.isEmpty m.selectedVertices then
                        defaultVertexStrength

                    else
                        presentUser m
                            |> User.getCommonVertexProperty m.selectedVertices .strength
                            |> Maybe.withDefault defaultVertexStrength
                , min = -2000
                , max = 0
                , step = 40
                , onChange = InputVertexStrength
                }
            , sliderInput
                { labelText = "Radius"
                , labelWidth = 80
                , value =
                    if Set.isEmpty m.selectedVertices then
                        presentUser m
                            |> User.getDefaultVertexProperties
                            |> .radius

                    else
                        case presentUser m |> User.getCommonVertexProperty m.selectedVertices .radius of
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
                            (presentUser m
                                |> User.getDefaultVertexProperties
                                |> .color
                            )

                    else
                        presentUser m
                            |> User.getCommonVertexProperty m.selectedVertices .color
                , msgOnColorClick = InputVertexColor
                , msgOnExpanderClick = ClickOnVertexColorPicker
                , msgOnLeave = MouseLeaveVertexColorPicker
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
            [ sliderInput
                { labelText = "Thickness"
                , labelWidth = 80
                , value =
                    if Set.isEmpty m.selectedEdges then
                        presentUser
                            m
                            |> User.getDefaultEdgeProperties
                            |> .thickness

                    else
                        presentUser
                            m
                            |> User.getCommonEdgeProperty m.selectedEdges .thickness
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
                        presentUser
                            m
                            |> User.getDefaultEdgeProperties
                            |> .distance

                    else
                        presentUser
                            m
                            |> User.getCommonEdgeProperty m.selectedEdges .distance
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
                        presentUser m
                            |> User.getDefaultEdgeProperties
                            |> .strength

                    else
                        presentUser m
                            |> User.getCommonEdgeProperty m.selectedEdges .strength
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
                            (presentUser m
                                |> User.getDefaultEdgeProperties
                                |> .color
                            )

                    else
                        presentUser m
                            |> User.getCommonEdgeProperty m.selectedEdges .color
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
                    case presentUser m |> User.getVertexProperties sourceId of
                        Just { position } ->
                            let
                                dEP =
                                    presentUser m |> User.getDefaultEdgeProperties
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
                            presentUser m
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
                (presentUser m
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
                (presentUser m
                    |> User.getVertices
                    |> List.filter (\{ id } -> Set.member id m.highlightedVertices)
                    |> List.map (.label >> drawHL)
                )

        maybeHighlightsOnSelectedEdges =
            let
                drawHL { from, to, label } =
                    case
                        ( presentUser m |> User.getVertexProperties from
                        , presentUser m |> User.getVertexProperties to
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
                (presentUser m
                    |> User.getEdges
                    |> List.filter (\{ from, to } -> Set.member ( from, to ) m.selectedEdges)
                    |> List.map drawHL
                )

        maybeHighlightOnMouseOveredEdges =
            let
                drawHL { from, to, label } =
                    case
                        ( presentUser m |> User.getVertexProperties from
                        , presentUser m |> User.getVertexProperties to
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
                (presentUser m
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
        , viewHulls (presentUser m)
        , maybeBrushedEdge
        , transparentInteractionRect
        , maybeHighlightsOnSelectedEdges
        , maybeHighlightOnMouseOveredEdges
        , maybeHighlightsOnSelectedVertices
        , maybeHighlightOnMouseOveredVertices
        , viewEdges (presentUser m)
        , viewVertices (presentUser m)
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
