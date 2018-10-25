module Main exposing (main)

import BoundingBox2d exposing (BoundingBox2d)
import Browser
import Browser.Dom as Dom
import Browser.Events exposing (Visibility(..))
import CheckBox
import Circle2d exposing (Circle2d)
import ColorPicker
import Colors exposing (Color)
import Dict exposing (Dict)
import Element as E exposing (Element)
import Element.Background as Background
import Element.Border as Border
import Element.Events as Events
import Element.Font as Font
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
import Task
import Time
import User exposing (BagId, BagProperties, EdgeId, EdgeProperties, User, VertexId, VertexProperties)
import Vector2d exposing (Vector2d)



-- TODO: Remove style.css after elm-ui


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
    { user : User

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
    { user = user

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
    | ClickOnResetZoomAndPanButton
      --
    | ClickOnHandTool
    | ClickOnDrawTool
    | ClickOnSelectTool
      --
    | ClickOnVader
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
    | MouseOverEdge EdgeId
    | MouseOutEdge EdgeId
    | MouseDownOnVertex VertexId
    | MouseUpOnVertex VertexId
    | MouseDownOnEdge EdgeId
    | MouseUpOnEdge EdgeId
      --
    | ClickOnBagPlus
    | ClickOnBagTrash
    | MouseOverBagItem BagId
    | MouseOutBagItem BagId
    | ClickOnBagItem BagId
    | CheckBoxConvexHull Bool
      --
    | ClickOnVertexTrash
    | MouseOverVertexItem VertexId
    | MouseOutVertexItem VertexId
    | ClickOnVertexItem VertexId
    | NumberInputVertexX String
    | NumberInputVertexY String
    | ColorPickerVertex Color
    | NumberInputRadius String
    | CheckBoxFixed Bool
    | NumberInputVertexStrength String
      --
    | ClickOnEdgeContract
    | ClickOnEdgeTrash
    | MouseOverEdgeItem EdgeId
    | MouseOutEdgeItem EdgeId
    | ClickOnEdgeItem EdgeId
    | ColorPickerEdge Color
    | NumberInputThickness String
    | NumberInputDistance String
    | NumberInputEdgeStrength String


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
                    m.user |> User.tick m.simulationState

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
                | user = newUser
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
                                        m.user
                            in
                            { m
                                | selectedVertices = newSelectedVertices
                                , selectedEdges = m.user |> User.inducedEdges newSelectedVertices
                            }

                        LineSelector ->
                            let
                                newSelectedEdges =
                                    User.edgeIdsIntersectiongLineSegment
                                        (LineSegment2d.from brushStart m.svgMousePosition)
                                        m.user
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
                    in
                    { m
                        | user = m.user |> User.setVertexPositions newVertexPositions
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
                            m.user |> User.addVertex m.svgMousePosition
                    in
                    stopSimulation
                        { m
                            | user = newUser
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
                            m.user
                                |> User.addVertex m.svgMousePosition

                        newUser =
                            userGraphWithAddedVertex
                                |> User.addEdge ( sourceId, newId )
                    in
                    reheatSimulation
                        { m
                            | user = newUser
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
                                    m.user |> User.duplicateSubgraph m.selectedVertices m.selectedEdges

                                else
                                    ( m.user, m.selectedVertices, m.selectedEdges )

                            else
                                ( m.user, Set.singleton id, Set.empty )
                    in
                    reheatSimulation
                        { m
                            | user = newUser
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
                        reheatSimulation
                            { m
                                | user = m.user |> User.addEdge ( sourceId, targetId )
                                , selectedTool = Draw DrawIdle
                            }

                _ ->
                    m

        MouseDownOnEdge ( s, t ) ->
            case m.selectedTool of
                Draw DrawIdle ->
                    let
                        ( newUser, idOfTheNewVertex ) =
                            m.user |> User.divideEdge m.svgMousePosition ( s, t )
                    in
                    stopSimulation
                        { m
                            | user = newUser
                            , highlightedEdges = Set.empty
                            , selectedTool = Draw (BrushingNewEdgeWithSourceId idOfTheNewVertex)
                        }

                Select SelectIdle ->
                    let
                        ( newUser, newSelectedVertices, newSelectedEdges ) =
                            if Set.member ( s, t ) m.selectedEdges then
                                if m.altIsDown then
                                    m.user |> User.duplicateSubgraph m.selectedVertices m.selectedEdges

                                else
                                    ( m.user, m.selectedVertices, m.selectedEdges )

                            else
                                ( m.user
                                , Set.fromList [ s, t ]
                                , Set.singleton ( s, t )
                                )
                    in
                    reheatSimulation
                        { m
                            | user = newUser
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
                            m.user |> User.divideEdge m.svgMousePosition ( s, t )

                        newUser =
                            newUser_ |> User.addEdge ( sourceId, newId )
                    in
                    reheatSimulation
                        { m
                            | user = newUser
                            , highlightedEdges = Set.empty
                            , selectedTool = Draw DrawIdle
                        }

                _ ->
                    m

        CheckBoxConvexHull b ->
            let
                updateCH bag =
                    { bag | hasConvexHull = b }
            in
            { m
                | user =
                    case m.maybeSelectedBag of
                        Just bagId ->
                            m.user |> User.updateBag bagId updateCH

                        Nothing ->
                            m.user |> User.updateDefaultBag updateCH
            }

        NumberInputVertexX str ->
            { m | user = m.user |> User.setCentroidX m.selectedVertices (str |> String.toFloat |> Maybe.withDefault 0) }

        NumberInputVertexY str ->
            { m | user = m.user |> User.setCentroidY m.selectedVertices (str |> String.toFloat |> Maybe.withDefault 0) }

        ColorPickerVertex newColor ->
            let
                updateColor v =
                    { v | color = newColor }
            in
            { m
                | user =
                    if Set.isEmpty m.selectedVertices then
                        m.user |> User.updateDefaultVertexProperties updateColor

                    else
                        m.user |> User.updateVertices m.selectedVertices updateColor
            }

        NumberInputRadius str ->
            let
                updateRadius v =
                    { v | radius = str |> String.toFloat |> Maybe.withDefault 0 |> clamp 4 20 }
            in
            { m
                | user =
                    if Set.isEmpty m.selectedVertices then
                        m.user |> User.updateDefaultVertexProperties updateRadius

                    else
                        m.user |> User.updateVertices m.selectedVertices updateRadius
            }

        NumberInputVertexStrength str ->
            let
                updateStrength v =
                    { v | strength = str |> String.toFloat |> Maybe.withDefault -60 |> clamp -1000 100 }
            in
            reheatSimulation
                { m
                    | user =
                        if Set.isEmpty m.selectedVertices then
                            m.user |> User.updateDefaultVertexProperties updateStrength

                        else
                            m.user |> User.updateVertices m.selectedVertices updateStrength
                }

        ColorPickerEdge newColor ->
            let
                updateColor e =
                    { e | color = newColor }
            in
            { m
                | user =
                    if Set.isEmpty m.selectedEdges then
                        m.user |> User.updateDefaultEdgeProperties updateColor

                    else
                        m.user |> User.updateEdges m.selectedEdges updateColor
            }

        CheckBoxFixed b ->
            let
                updateFixed v =
                    { v | fixed = b }
            in
            reheatSimulation
                { m
                    | user =
                        if Set.isEmpty m.selectedVertices then
                            m.user |> User.updateDefaultVertexProperties updateFixed

                        else
                            m.user |> User.updateVertices m.selectedVertices updateFixed
                }

        NumberInputThickness str ->
            let
                updateThickness e =
                    { e | thickness = str |> String.toFloat |> Maybe.withDefault 0 |> clamp 1 20 }
            in
            { m
                | user =
                    if Set.isEmpty m.selectedEdges then
                        m.user |> User.updateDefaultEdgeProperties updateThickness

                    else
                        m.user |> User.updateEdges m.selectedEdges updateThickness
            }

        NumberInputDistance str ->
            let
                updateDistance e =
                    { e | distance = str |> String.toFloat |> Maybe.withDefault 0 |> clamp 0 2000 }
            in
            reheatSimulation
                { m
                    | user =
                        if Set.isEmpty m.selectedEdges then
                            m.user |> User.updateDefaultEdgeProperties updateDistance

                        else
                            m.user |> User.updateEdges m.selectedEdges updateDistance
                }

        NumberInputEdgeStrength str ->
            let
                updateStrength e =
                    { e | strength = str |> String.toFloat |> Maybe.withDefault 0 |> clamp 0 1 }
            in
            reheatSimulation
                { m
                    | user =
                        if Set.isEmpty m.selectedEdges then
                            m.user |> User.updateDefaultEdgeProperties updateStrength

                        else
                            m.user |> User.updateEdges m.selectedEdges updateStrength
                }

        ClickOnVertexTrash ->
            let
                newUser =
                    m.user |> User.removeVertices m.selectedVertices
            in
            reheatSimulation
                { m
                    | user = newUser
                    , selectedVertices = Set.empty
                    , highlightedVertices = Set.empty
                    , selectedEdges = Set.empty
                    , highlightedEdges = Set.empty
                }

        ClickOnEdgeTrash ->
            let
                newUser =
                    m.user |> User.removeEdges m.selectedEdges
            in
            reheatSimulation
                { m
                    | user = newUser
                    , highlightedEdges = Set.empty
                    , selectedEdges = Set.empty
                }

        ClickOnEdgeContract ->
            case Set.toList m.selectedEdges of
                [ selectedEdge ] ->
                    let
                        newUser =
                            m.user |> User.contractEdge selectedEdge
                    in
                    reheatSimulation
                        { m
                            | user = newUser
                            , highlightedEdges = Set.empty
                            , selectedEdges = Set.empty
                        }

                _ ->
                    m

        ClickOnBagTrash ->
            case m.maybeSelectedBag of
                Just bagId ->
                    { m
                        | user = m.user |> User.removeBag bagId
                        , maybeSelectedBag = Nothing
                    }

                Nothing ->
                    m

        ClickOnBagPlus ->
            let
                ( newUser, idOfTheNewBag ) =
                    m.user |> User.addBag m.selectedVertices
            in
            { m
                | user = newUser
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
            { m | highlightedVertices = m.user |> User.getVerticesInBag bagId }

        MouseOutBagItem _ ->
            { m | highlightedVertices = Set.empty }

        ClickOnBagItem bagId ->
            let
                ( newMaybeSelectedBag, newSelectedVertices ) =
                    if m.maybeSelectedBag == Just bagId then
                        ( Nothing, Set.empty )

                    else
                        ( Just bagId, m.user |> User.getVerticesInBag bagId )
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


colors =
    { white = E.rgb255 255 255 255
    , black = E.rgb255 0 0 0
    , menuBackground = E.rgb255 83 83 83
    , menuBorder = E.rgb255 56 56 56
    , selectedItem = E.rgb255 48 48 48
    , text = E.rgb255 243 243 243
    , leftBarHeader = E.rgb255 66 66 66
    }


layoutParams =
    { minimumTotalWidth = 1000
    , leftStripeWidth = 40
    , leftBarWidth = 260
    , topBarHeight = 54
    , rightBarWidth = 300
    }


view : Model -> Html Msg
view m =
    E.layout
        [ Font.color colors.text
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
        , E.htmlAttribute <| HA.style "-webkit-font-smoothing" "antialiased"
        , E.htmlAttribute <| HA.style "user-select" "none"
        ]
    <|
        E.row [ E.width (E.fill |> E.minimum layoutParams.minimumTotalWidth), E.height E.fill ] <|
            [ leftStripe m
            , leftBar m
            , E.column [ E.width E.fill, E.height E.fill ] <|
                [ topBar m
                , E.el [ E.width E.fill, E.height E.fill ] <|
                    E.html (mainSvg m)
                ]
            , rightBar m
            ]


leftStripe : Model -> Element Msg
leftStripe m =
    let
        a =
            42

        modeButton title selectedMode iconPath =
            let
                color =
                    if selectedMode == m.selectedMode then
                        "white"

                    else
                        "rgb(48,48,48)"
            in
            E.el
                [ E.htmlAttribute <| HA.title title
                , Events.onClick (ClickOnLeftMostBarRadioButton selectedMode)
                , E.pointer
                ]
            <|
                E.html (Icons.draw40pxWithColor color iconPath)

        radioButtonsForMode =
            E.column [ E.alignTop ]
                [ modeButton "Preferences" Preferences Icons.icons.preferencesGear
                , modeButton "Lists of Bags, Vertices and Edges" ListsOfBagsVerticesAndEdges Icons.icons.listOfThree
                , modeButton "Graph Operations" GraphOperations Icons.icons.magicStick
                , modeButton "Graph Queries" GraphQueries Icons.icons.qForQuery
                , modeButton "Graph Generators" GraphGenerators Icons.icons.lightning
                , modeButton "Algorithm Visualizations" AlgorithmVisualizations Icons.icons.algoVizPlay
                , modeButton "Games on Graphs" GamesOnGraphs Icons.icons.chessHorse
                ]

        githubButton =
            E.newTabLink
                [ E.htmlAttribute <| HA.title "Source Code"
                , E.alignBottom
                , E.pointer
                ]
                { url = "https://github.com/erkal/kite"
                , label = E.html (Icons.draw40pxWithColor "yellow" Icons.icons.githubCat)
                }

        --donateButton =
        --    E.newTabLink
        --        [ E.htmlAttribute <| HA.title "Donate"
        --        , E.alignBottom
        --        ]
        --        { url = "lalala"
        --        , label = E.html (Icons.draw40pxWithColor "orchid" Icons.icons.donateHeart)
        --        }
    in
    E.column
        [ Background.color colors.black
        , E.width (E.px layoutParams.leftStripeWidth)
        , E.height E.fill
        ]
        [ radioButtonsForMode
        , githubButton

        --, donateButton
        ]



-- LEFT BAR


leftBar : Model -> Element Msg
leftBar m =
    E.el
        [ Background.color colors.menuBackground
        , Border.widthEach { bottom = 0, left = 0, right = 1, top = 0 }
        , Border.color colors.menuBorder
        , E.width (E.px layoutParams.leftBarWidth)
        , E.height E.fill
        , E.scrollbarY
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
            E.row
                [ Background.color colors.leftBarHeader
                , Font.size 12
                , E.width E.fill
                , E.padding 8
                , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
                , Border.color colors.menuBorder
                ]
            <|
                headerItems
    in
    E.column [ E.width E.fill ] <|
        [ header, content ]


leftBarHeaderButton title onClickMsg iconPath =
    E.el
        [ E.htmlAttribute <| HA.title title
        , Events.onClick onClickMsg
        , E.alignRight
        , Border.rounded 4
        , E.mouseDown [ Background.color colors.selectedItem ]
        , E.mouseOver [ Background.color colors.menuBorder ]
        , E.pointer
        ]
    <|
        E.html (Icons.draw24px iconPath)


leftBarContentForPreferences : Model -> Element Msg
leftBarContentForPreferences m =
    leftBarMenu [ E.text "Preferences (coming soon)" ] <| E.none


leftBarContentForListsOfBagsVerticesAndEdges : Model -> Element Msg
leftBarContentForListsOfBagsVerticesAndEdges m =
    let
        a =
            42
    in
    E.column [ E.width E.fill ]
        [ leftBarMenu [ E.text "Bags" ] <| E.none
        , leftBarMenu
            [ E.text "Vertices"
            , leftBarHeaderButton "Remove Selected Vertices"
                ClickOnVertexTrash
                Icons.icons.trash
            ]
          <|
            E.none
        , leftBarMenu
            [ E.text "Edges"
            , leftBarHeaderButton "Remove Selected Edges"
                ClickOnEdgeTrash
                Icons.icons.trash
            ]
          <|
            E.none
        ]


leftBarContentForGraphOperations : Model -> Element Msg
leftBarContentForGraphOperations m =
    leftBarMenu [ E.text "Graph Operations (coming soon)" ] <| E.none


leftBarContentForGraphQueries : Model -> Element Msg
leftBarContentForGraphQueries m =
    leftBarMenu [ E.text "Graph Queries (coming soon)" ] <| E.none


leftBarContentForGraphGenerators : Model -> Element Msg
leftBarContentForGraphGenerators m =
    leftBarMenu [ E.text "Graph Generators (coming soon)" ] <| E.none


leftBarContentForAlgorithmVisualizations : Model -> Element Msg
leftBarContentForAlgorithmVisualizations m =
    leftBarMenu [ E.text "Algorithm Visualizations (coming soon)" ] <| E.none


leftBarContentForGamesOnGraphs : Model -> Element Msg
leftBarContentForGamesOnGraphs m =
    leftBarMenu [ E.text "Games on Graphs (coming soon)" ] <| E.none



-- TOP BAR


topBar : Model -> Element Msg
topBar m =
    let
        oneClickButton title iconPath onClickMsg =
            E.el
                [ Border.width 1
                , Border.rounded 4
                , Border.color colors.menuBorder
                , E.mouseDown [ Background.color colors.selectedItem ]
                , E.mouseOver [ Background.color colors.menuBorder ]
                , Events.onClick onClickMsg
                , E.htmlAttribute <| HA.title title
                , E.pointer
                ]
            <|
                E.html (Icons.draw34px iconPath)

        radioButtonGroup buttonList =
            E.row
                [ Border.width 1
                , Border.color colors.menuBorder
                , E.padding 4
                , E.spacing 4
                ]
                buttonList

        radioButton title iconPath onClickMsg backgroundColor =
            E.el
                [ Background.color backgroundColor
                , E.mouseDown [ Background.color colors.selectedItem ]
                , E.mouseOver [ Background.color colors.menuBorder ]
                , Border.rounded 4
                , Events.onClick onClickMsg
                , E.htmlAttribute <| HA.title title
                , E.pointer
                ]
            <|
                E.html (Icons.draw34px iconPath)
    in
    E.el
        [ Background.color colors.menuBackground
        , Border.widthEach { bottom = 1, left = 0, right = 0, top = 0 }
        , Border.color colors.menuBorder
        , E.width E.fill
        , E.height (E.px layoutParams.topBarHeight)
        ]
    <|
        E.row [ E.centerY, E.paddingXY 16 0, E.spacing 16 ] <|
            [ oneClickButton "Reset Zoom and Pan"
                Icons.icons.resetZoomAndPan
                ClickOnResetZoomAndPanButton
            , radioButtonGroup
                [ radioButton "Hand (H)"
                    Icons.icons.hand
                    ClickOnHandTool
                  <|
                    case m.selectedTool of
                        Hand _ ->
                            colors.selectedItem

                        _ ->
                            colors.menuBackground
                , radioButton "Selection (S)"
                    Icons.icons.pointer
                    ClickOnSelectTool
                  <|
                    case m.selectedTool of
                        Select _ ->
                            colors.selectedItem

                        _ ->
                            colors.menuBackground
                , radioButton "Draw (D)"
                    Icons.icons.pen
                    ClickOnDrawTool
                  <|
                    case m.selectedTool of
                        Draw _ ->
                            colors.selectedItem

                        _ ->
                            colors.menuBackground
                ]
            , radioButtonGroup
                [ radioButton "Force (F)"
                    Icons.icons.vader
                    ClickOnVader
                  <|
                    if m.vaderIsOn then
                        colors.selectedItem

                    else
                        colors.menuBackground
                ]
            ]



--RIGHT BAR


rightBar : Model -> Element Msg
rightBar m =
    E.el
        [ Background.color colors.menuBackground
        , Border.widthEach { bottom = 0, left = 1, right = 0, top = 0 }
        , Border.color colors.menuBorder
        , E.width (E.px layoutParams.rightBarWidth)
        , E.height E.fill
        ]
        E.none



--leftBarContentForListsOfBagsVerticesAndEdges : Model -> List (Html Msg)
--leftBarContentForListsOfBagsVerticesAndEdges m =
--    let
--        -- BAGS
--        viewBagList =
--            div []
--                [ bagsHeader
--                , listOfBags
--                ]
--        bagsHeader =
--            leftBarHeader
--                [ leftBarHeaderText "Bags"
--                , div
--                    [ HA.class "button"
--                    , HA.title "Remove Selected Bag"
--                    , HE.onClick ClickOnBagTrash
--                    ]
--                    [ Icons.draw24px Icons.icons.trash
--                    ]
--                , div
--                    [ HA.class "button"
--                    , HA.title "Add New Bag"
--                    , HE.onClick ClickOnBagPlus
--                    ]
--                    [ Icons.draw24px Icons.icons.plus ]
--                ]
--        listOfBags =
--            div []
--                (m.user
--                    |> User.getBags
--                    |> Dict.map bagItem
--                    |> Dict.values
--                    |> List.reverse
--                )
--        bagItem bagId _ =
--            div
--                [ HA.style "padding" "4px 20px 4px 20px"
--                , HA.class <|
--                    if Just bagId == m.maybeSelectedBag then
--                        "leftBarContent-item-selected"
--                    else
--                        "leftBarContent-item"
--                , HE.onMouseOver (MouseOverBagItem bagId)
--                , HE.onMouseOut (MouseOutBagItem bagId)
--                , HE.onClick (ClickOnBagItem bagId)
--                ]
--                [ H.text (m.user |> User.bagElementsInCurlyBraces bagId) ]
--        -- VERTICES
--        viewVertexList =
--            div []
--                [ verticesHeader
--                , listOfVertices
--                ]
--        listOfVertices =
--            div []
--                (m.user
--                    |> User.getVertices
--                    |> List.map vertexItem
--                    |> List.reverse
--                )
--        vertexItem { id } =
--            div
--                [ HA.style "padding" "4px 20px 4px 20px"
--                , HA.class <|
--                    if Set.member id m.selectedVertices then
--                        "leftBarContent-item-selected"
--                    else
--                        "leftBarContent-item"
--                , if Set.member id m.highlightedVertices then
--                    HA.style "border-right" ("10px solid " ++ Colors.highlightColorForMouseOver)
--                  else
--                    HA.style "" ""
--                , HE.onMouseOver (MouseOverVertexItem id)
--                , HE.onMouseOut (MouseOutVertexItem id)
--                , HE.onClick (ClickOnVertexItem id)
--                ]
--                [ H.text (String.fromInt id) ]
--        -- EDGES
--        viewEdgeList =
--            div []
--                [ edgesHeader
--                , listOfEdges
--                ]
--        maybeEdgeContractButton =
--            if Set.size m.selectedEdges == 1 then
--                div
--                    [ HA.class "button"
--                    , HE.onClick ClickOnEdgeContract
--                    , HA.title "Contract the selected edge"
--                    ]
--                    [ Icons.draw24px Icons.icons.edgeContract
--                    ]
--            else
--                div [] []
--        edgesHeader =
--            leftBarHeader
--                [ leftBarHeaderText "Edges"
--                , div
--                    [ HA.class "button"
--                    , HA.title "Remove Selected Edges"
--                    , HE.onClick ClickOnEdgeTrash
--                    ]
--                    [ Icons.draw24px Icons.icons.trash
--                    ]
--                , maybeEdgeContractButton
--                ]
--        listOfEdges =
--            div []
--                (m.user
--                    |> User.getEdges
--                    |> List.map edgeItem
--                    |> List.reverse
--                )
--        edgeItem { from, to } =
--            div
--                [ HA.style "padding" "4px 20px 4px 20px"
--                , HA.class <|
--                    if Set.member ( from, to ) m.selectedEdges then
--                        "leftBarContent-item-selected"
--                    else
--                        "leftBarContent-item"
--                , if Set.member ( from, to ) m.highlightedEdges then
--                    HA.style "border-right" ("10px solid " ++ Colors.highlightColorForMouseOver)
--                  else
--                    HA.style "" ""
--                , HE.onMouseOver (MouseOverEdgeItem ( from, to ))
--                , HE.onMouseOut (MouseOutEdgeItem ( from, to ))
--                , HE.onClick (ClickOnEdgeItem ( from, to ))
--                ]
--                [ H.text <| String.fromInt from ++ " → " ++ String.fromInt to ]
--    in
--    [ viewBagList
--    , viewVertexList
--    , viewEdgeList
--    ]
---- RIGHT BAR
--subMenu : String -> List (Html Msg) -> Html Msg
--subMenu header rest =
--    div [ HA.class "right-bar-submenu" ] <|
--        div [ HA.style "margin-bottom" "20px" ]
--            [ div [ HA.class "right-bar-submenu-header" ] [ H.text header ] ]
--            :: rest
--lineWithColumns : Int -> List (Html Msg) -> Html Msg
--lineWithColumns columnSize columns =
--    let
--        item content =
--            div
--                [ HA.style "display" "inline-block"
--                , HA.style "width" (String.fromInt columnSize ++ "px")
--                ]
--                [ content ]
--    in
--    div
--        [ HA.style "margin-bottom" "10px"
--        , HA.style "display" "block"
--        ]
--        (List.map item columns)
--input : String -> Html Msg -> Html Msg
--input label inputField =
--    div []
--        [ H.label
--            [ HA.style "width" "80px"
--            , HA.style "padding-right" "8px"
--            , HA.style "vertical-align" "middle"
--            , HA.style "display" "inline-block"
--            , HA.style "text-align" "right"
--            ]
--            [ H.text label ]
--        , div [ HA.style "display" "inline-block" ] [ inputField ]
--        ]
--numberInput : List (H.Attribute msg) -> Html msg
--numberInput attributes =
--    H.input
--        ([ HA.style "width" "40px"
--         , HA.style "padding-left" "4px"
--         , HA.style "padding-top" "4px"
--         , HA.style "padding-bottom" "4px"
--         , HA.type_ "number"
--         ]
--            ++ attributes
--        )
--        []
--selectionType : Model -> Html Msg
--selectionType m =
--    let
--        rectSelector =
--            div
--                [ HA.style "float" "left"
--                , HA.style "margin" "1px"
--                , HA.title "Rectangle Selector"
--                , HE.onClick ClickOnRectSelector
--                , HA.class <|
--                    case m.selectedSelector of
--                        RectSelector ->
--                            "radio-button-selected"
--                        _ ->
--                            "radio-button"
--                ]
--                [ Icons.draw24px Icons.icons.selectionRect ]
--        lineSelector =
--            div
--                [ HA.style "float" "left"
--                , HA.style "margin" "1px"
--                , HA.title "Line Selector"
--                , HE.onClick ClickOnLineSelector
--                , HA.class <|
--                    case m.selectedSelector of
--                        LineSelector ->
--                            "radio-button-selected"
--                        _ ->
--                            "radio-button"
--                ]
--                [ Icons.draw24px Icons.icons.selectionLine ]
--    in
--    subMenu "Selection"
--        [ lineWithColumns 280
--            [ input "Selector" <|
--                div
--                    [ HA.style "vertical-align" "middle"
--                    , HA.style "display" "inline-block"
--                    ]
--                    [ div [ HA.class "radio-button-group" ]
--                        [ rectSelector
--                        , lineSelector
--                        ]
--                    ]
--            ]
--        ]
--headerForBagProperties : Model -> String
--headerForBagProperties m =
--    case m.maybeSelectedBag of
--        Nothing ->
--            "Bag Preferences"
--        Just bagId ->
--            "Selected Bag"
--bagProperties : Model -> Html Msg
--bagProperties m =
--    subMenu (headerForBagProperties m)
--        [ lineWithColumns 140
--            [ input "Convex Hull" <|
--                H.map CheckBoxConvexHull <|
--                    CheckBox.view <|
--                        case m.maybeSelectedBag of
--                            Just bagId ->
--                                case User.getBagProperties bagId m.user of
--                                    Just bag ->
--                                        Just bag.hasConvexHull
--                                    Nothing ->
--                                        Nothing
--                            Nothing ->
--                                Just (m.user |> User.getDefaultBagProperties |> .hasConvexHull)
--            ]
--        ]
--vertexProperties : Model -> Html Msg
--vertexProperties m =
--    let
--        headerForVertexProperties =
--            case Set.size m.selectedVertices of
--                0 ->
--                    "Vertex Preferences"
--                1 ->
--                    "Selected Vertex"
--                _ ->
--                    "Selected Vertices"
--    in
--    subMenu headerForVertexProperties
--        [ lineWithColumns 140
--            [ input "X" <|
--                numberInput
--                    [ HA.value
--                        (m.user
--                            |> User.getCentroid m.selectedVertices
--                            |> Maybe.map Point2d.xCoordinate
--                            |> Maybe.map round
--                            |> Maybe.map String.fromInt
--                            |> Maybe.withDefault ""
--                        )
--                    , HE.onInput NumberInputVertexX
--                    ]
--            , input "Y" <|
--                numberInput
--                    [ HA.value
--                        (m.user
--                            |> User.getCentroid m.selectedVertices
--                            |> Maybe.map Point2d.yCoordinate
--                            |> Maybe.map round
--                            |> Maybe.map String.fromInt
--                            |> Maybe.withDefault ""
--                        )
--                    , HE.onInput NumberInputVertexY
--                    ]
--            ]
--        , lineWithColumns 140
--            [ input "Color" <|
--                H.map ColorPickerVertex <|
--                    ColorPicker.view <|
--                        if Set.isEmpty m.selectedVertices then
--                            Just (m.user |> User.getDefaultVertexProperties |> .color)
--                        else
--                            m.user |> User.getCommonVertexProperty m.selectedVertices .color
--            , input "Radius" <|
--                numberInput
--                    [ HA.min "4"
--                    , HA.max "20"
--                    , HA.step "1"
--                    , HA.value <|
--                        if Set.isEmpty m.selectedVertices then
--                            m.user |> User.getDefaultVertexProperties |> .radius |> String.fromFloat
--                        else
--                            case m.user |> User.getCommonVertexProperty m.selectedVertices .radius of
--                                Just r ->
--                                    String.fromFloat r
--                                Nothing ->
--                                    ""
--                    , HE.onInput NumberInputRadius
--                    ]
--            ]
--        , lineWithColumns 140
--            [ input "Fixed"
--                (H.map CheckBoxFixed
--                    (CheckBox.view <|
--                        if Set.isEmpty m.selectedVertices then
--                            Just (m.user |> User.getDefaultVertexProperties |> .fixed)
--                        else
--                            m.user |> User.getCommonVertexProperty m.selectedVertices .fixed
--                    )
--                )
--            , input "Strength" <|
--                numberInput
--                    [ HA.min "-1000"
--                    , HA.max "100"
--                    , HA.step "1"
--                    , HA.value <|
--                        if Set.isEmpty m.selectedVertices then
--                            m.user |> User.getDefaultVertexProperties |> .strength |> String.fromFloat
--                        else
--                            case m.user |> User.getCommonVertexProperty m.selectedVertices .strength of
--                                Just s ->
--                                    String.fromFloat s
--                                Nothing ->
--                                    ""
--                    , HE.onInput NumberInputVertexStrength
--                    ]
--            ]
--        ]
--edgeProperties : Model -> Html Msg
--edgeProperties m =
--    let
--        headerForEdgeProperties =
--            case Set.size m.selectedEdges of
--                0 ->
--                    "Edge Preferences"
--                1 ->
--                    "Selected Edge"
--                _ ->
--                    "Selected Edges"
--    in
--    subMenu headerForEdgeProperties
--        [ lineWithColumns 140
--            [ input "Color" <|
--                H.map ColorPickerEdge <|
--                    ColorPicker.view <|
--                        if Set.isEmpty m.selectedEdges then
--                            Just (m.user |> User.getDefaultEdgeProperties |> .color)
--                        else
--                            m.user |> User.getCommonEdgeProperty m.selectedEdges .color
--            , input "thickness" <|
--                numberInput
--                    [ HA.value <|
--                        if Set.isEmpty m.selectedEdges then
--                            m.user |> User.getDefaultEdgeProperties |> .thickness |> String.fromFloat
--                        else
--                            case m.user |> User.getCommonEdgeProperty m.selectedEdges .thickness of
--                                Just r ->
--                                    String.fromFloat r
--                                Nothing ->
--                                    ""
--                    , HE.onInput NumberInputThickness
--                    , HA.min "1"
--                    , HA.max "20"
--                    , HA.step "1"
--                    ]
--            ]
--        , lineWithColumns 140
--            [ input "distance" <|
--                numberInput
--                    [ HA.value <|
--                        if Set.isEmpty m.selectedEdges then
--                            m.user |> User.getDefaultEdgeProperties |> .distance |> String.fromFloat
--                        else
--                            case m.user |> User.getCommonEdgeProperty m.selectedEdges .distance of
--                                Just r ->
--                                    String.fromFloat r
--                                Nothing ->
--                                    ""
--                    , HE.onInput NumberInputDistance
--                    , HA.min "0"
--                    , HA.max "2000"
--                    , HA.step "1"
--                    ]
--            , input "strength" <|
--                numberInput
--                    [ HA.value <|
--                        if Set.isEmpty m.selectedEdges then
--                            m.user |> User.getDefaultEdgeProperties |> .strength |> String.fromFloat
--                        else
--                            case m.user |> User.getCommonEdgeProperty m.selectedEdges .strength of
--                                Just r ->
--                                    String.fromFloat r
--                                Nothing ->
--                                    ""
--                    , HE.onInput NumberInputEdgeStrength
--                    , HA.min "0"
--                    , HA.max "1"
--                    , HA.step "0.05"
--                    ]
--            ]
--        ]
--rightBar : Model -> Html Msg
--rightBar m =
--    div
--        [ HA.id "rightBar"
--        , HA.style "right" "0px"
--        , HA.style "width" (String.fromInt 300 ++ "px")
--        , HA.style "height" "100%"
--        ]
--        [ selectionType m
--        , bagProperties m
--        , vertexProperties m
--        , edgeProperties m
--        ]
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
                    , SA.stroke "rgb(83, 83, 83)"
                    , SA.fill "none"
                    , SA.strokeWidth (String.fromFloat (1 / m.zoom))
                    ]
                    []
                , S.line
                    [ SA.x1 "100"
                    , SA.y1 "0"
                    , SA.x2 "100"
                    , SA.y2 (String.fromFloat (-5 / m.zoom))
                    , SA.stroke "rgb(83, 83, 83)"
                    , SA.strokeWidth (String.fromFloat (1 / m.zoom))
                    ]
                    []
                , S.text_
                    [ SA.x "100"
                    , SA.y (String.fromFloat (-24 / m.zoom))
                    , SA.fill "rgb(83, 83, 83)"
                    , SA.textAnchor "middle"
                    , SA.fontSize (String.fromFloat (12 / m.zoom))
                    ]
                    [ S.text <| String.fromInt (round (100 * m.zoom)) ++ "%" ]
                , S.text_
                    [ SA.x "100"
                    , SA.y (String.fromFloat (-10 / m.zoom))
                    , SA.fill "rgb(83, 83, 83)"
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
                    case User.getVertexProperties sourceId m.user of
                        Just { position } ->
                            let
                                dEP =
                                    m.user |> User.getDefaultEdgeProperties
                            in
                            Geometry.Svg.lineSegment2d
                                [ SA.strokeWidth (String.fromFloat dEP.thickness)
                                , SA.stroke dEP.color
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
                                [ SA.stroke "rgb(127,127,127)"
                                , SA.strokeWidth "1"
                                , SA.strokeDasharray "1 2"
                                , SA.fill "none"
                                ]
                                (BoundingBox2d.from brushStart m.svgMousePosition)

                        LineSelector ->
                            Geometry.Svg.lineSegment2d
                                [ SA.stroke "rgb(127,127,127)"
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
                            User.getBoundingBoxWithMargin selectedVertices m.user
                    in
                    case maybeBoudingBox of
                        Just bB ->
                            Geometry.Svg.boundingBox2d
                                [ SA.strokeWidth "1"
                                , SA.stroke "rgb(40,127,230)"
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
                        [ SA.fill Colors.colorHighlightForSelection ]
                        (position |> Circle2d.withRadius (radius + 4))
            in
            S.g []
                (m.user
                    |> User.getVertices
                    |> List.filter (\{ id } -> Set.member id m.selectedVertices)
                    |> List.map (.label >> drawHL)
                )

        maybeHighlightOnMouseOveredVertices =
            let
                drawHL { position, radius } =
                    Geometry.Svg.circle2d
                        [ SA.fill Colors.highlightColorForMouseOver ]
                        (position |> Circle2d.withRadius (radius + 4))
            in
            S.g []
                (m.user
                    |> User.getVertices
                    |> List.filter (\{ id } -> Set.member id m.highlightedVertices)
                    |> List.map (.label >> drawHL)
                )

        maybeHighlightsOnSelectedEdges =
            let
                drawHL { from, to, label } =
                    case ( User.getVertexProperties from m.user, User.getVertexProperties to m.user ) of
                        ( Just v, Just w ) ->
                            Geometry.Svg.lineSegment2d
                                [ SA.stroke Colors.colorHighlightForSelection
                                , SA.strokeWidth (String.fromFloat (label.thickness + 6))
                                ]
                                (LineSegment2d.from v.position w.position)

                        _ ->
                            -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE" <|
                            emptySvgElement
            in
            S.g []
                (m.user
                    |> User.getEdges
                    |> List.filter (\{ from, to } -> Set.member ( from, to ) m.selectedEdges)
                    |> List.map drawHL
                )

        maybeHighlightOnMouseOveredEdges =
            let
                drawHL { from, to, label } =
                    case ( User.getVertexProperties from m.user, User.getVertexProperties to m.user ) of
                        ( Just v, Just w ) ->
                            Geometry.Svg.lineSegment2d
                                [ SA.stroke Colors.highlightColorForMouseOver
                                , SA.strokeWidth (String.fromFloat (label.thickness + 6))
                                ]
                                (LineSegment2d.from v.position w.position)

                        _ ->
                            -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE" <|
                            emptySvgElement
            in
            S.g []
                (m.user
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
        [ HA.style "background-color" "rgb(46, 46, 46)"
        , HA.style "cursor" cursor
        , HA.style "position" "absolute"
        , SA.width (String.fromInt mainSvgWidth)
        , SA.height (String.fromInt mainSvgHeight)
        , SA.viewBox (fromPanAndZoom m.pan m.zoom)
        , SE.onMouseDown MouseDownOnMainSvg
        , HE.on "wheel" (Decode.map WheelDeltaY wheelDeltaY)
        ]
        [ pageA4WithRuler
        , viewHulls m.user
        , maybeBrushedEdge
        , transparentInteractionRect
        , maybeHighlightsOnSelectedEdges
        , maybeHighlightOnMouseOveredEdges
        , maybeHighlightsOnSelectedVertices
        , maybeHighlightOnMouseOveredVertices
        , viewEdges m.user
        , viewVertices m.user
        , maybeBrushedSelector
        , maybeRectAroundSelectedVertices
        ]



-- GRAPH VIEW


viewEdges : User -> Html Msg
viewEdges user =
    let
        drawEdge { from, to, label } =
            case ( User.getVertexProperties from user, User.getVertexProperties to user ) of
                ( Just v, Just w ) ->
                    S.g
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
                            [ SA.stroke label.color
                            , SA.strokeWidth (String.fromFloat label.thickness)
                            ]
                            (LineSegment2d.from v.position w.position)
                        ]

                _ ->
                    -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE" <|
                    emptySvgElement
    in
    S.g [] (List.map drawEdge (User.getEdges user))


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

        drawVertex { id, label } =
            let
                { position, color, radius, fixed } =
                    label

                ( x, y ) =
                    Point2d.coordinates position
            in
            S.g
                [ SA.transform <| "translate(" ++ String.fromFloat x ++ "," ++ String.fromFloat y ++ ")"
                , SE.onMouseDown (MouseDownOnVertex id)
                , SE.onMouseUp (MouseUpOnVertex id)
                , SE.onMouseOver (MouseOverVertex id)
                , SE.onMouseOut (MouseOutVertex id)
                ]
                [ Geometry.Svg.circle2d [ SA.fill color ]
                    (Point2d.origin |> Circle2d.withRadius radius)
                , pin fixed radius
                ]
    in
    S.g [] (user |> User.getVertices |> List.map drawVertex)


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
