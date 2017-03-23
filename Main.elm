port module Main exposing (..)

import Char
import CssHelpers
import Dict
import Digraph
import Digraph.Examples.HyperCubes
import Digraph.Examples.MultiFoci
import Digraph.Examples.SimpleOnes
import Digraph.Generators.Basic
import Digraph.Json.Decode
import Digraph.Json.Encode
import FileSystem
import FileSystem.InputFileName
import FileSystem.Json.Decode
import FileSystem.Json.Encode
import FileSystem.View.ControlButtons
import FileSystem.View.FolderTree
import FileSystem.View.Tabs
import Html exposing (Html, div)
import Html.Attributes exposing (style)
import Html.Events
import Json.Decode
import Json.Encode exposing (Value)
import Keyboard
import PageLayout
import Svg
import Widgets
import Widgets.AddRemoveVerticesAndEdges as AddRemoveVerticesAndEdges
import Widgets.D3Force as D3Force
import Widgets.PanZoom as PanZoom
import Widgets.RandomGraph as RandomGraph
import Widgets.SelectAndEdit as SelectAndEdit


--

import Digraph
import Digraph.Json.Encode
import Digraph.Json.Decode
import Digraph.Examples.SimpleOnes
import Digraph.Examples.HyperCubes
import Digraph.Examples.MultiFoci
import Digraph.Generators.Basic


--

import FileSystem
import FileSystem.Json.Encode
import FileSystem.Json.Decode
import FileSystem.View.Tabs
import FileSystem.View.FolderTree
import FileSystem.View.ControlButtons
import FileSystem.InputFileName


--

import Widgets
import Widgets.SelectAndEdit as SelectAndEdit
import Widgets.AddRemoveVerticesAndEdges as AddRemoveVerticesAndEdges
import Widgets.D3Force as D3Force
import Widgets.RandomGraph as RandomGraph
import Widgets.PanZoom as PanZoom


--

import CssHelpers
import PageLayout
import WelcomeWindow


main : Program (Maybe Value) Model Msg
main =
    Html.programWithFlags
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { fileSystemIsVisible : Bool
    , welcomeWindowIsVisible : Bool
    , layout : PageLayout.Model
    , fileSystem : FileSystem.Model Digraph.Model
    , fileSearchInput : String
    , shortcutKeysAreActive : Bool
    , widgets : Widgets.Model
    , addRemoveVerticesAndEdges : AddRemoveVerticesAndEdges.Model
    , vertexSelector : SelectAndEdit.Model
    , randomGraph : RandomGraph.Model
    , d3Force : D3Force.Model
    , panZoom : PanZoom.Model
    }


init : Maybe Value -> ( Model, Cmd Msg )
init maybeStoredFileSystem =
    let
        standardGraphs : FileSystem.Model Digraph.Model
        standardGraphs =
            FileSystem.init Digraph.empty
                |> FileSystem.newFile "~/simple/frucht-Graph" Digraph.Examples.SimpleOnes.fruchtGraph
                |> FileSystem.newFile "~/kite with fixed node" Digraph.Examples.SimpleOnes.kiteWithFixedNode
                |> FileSystem.newFile "~/hypercubes/3d" (Digraph.Examples.HyperCubes.create 3)
                |> FileSystem.newFile "~/hypercubes/5d" (Digraph.Examples.HyperCubes.create 5)
                |> FileSystem.newFile "~/hypercubes/7d" (Digraph.Examples.HyperCubes.create 7)
                |> FileSystem.newFile "~/a/b/multi-foci" Digraph.Examples.MultiFoci.multifoci

        fileSystem : FileSystem.Model Digraph.Model
        fileSystem =
            case maybeStoredFileSystem of
                Just storedFileSystem ->
                    case Json.Decode.decodeValue (FileSystem.Json.Decode.fileSystemDecoder Digraph.Json.Decode.digraphDecoder) storedFileSystem of
                        Err msg ->
                            Debug.log msg standardGraphs

                        Ok fileSystem ->
                            fileSystem

                Nothing ->
                    standardGraphs

        initialModel =
            { welcomeWindowIsVisible = True
            , fileSystemIsVisible = False
            , widgets =
                Widgets.initialModel
                    [ AddRemoveVerticesAndEdges.widgetName
                    , SelectAndEdit.widgetName
                    , RandomGraph.widgetName
                    , D3Force.widgetName
                    , PanZoom.widgetName
                    ]
            , layout = PageLayout.calculate { windowWidth = 800, windowHeight = 600 }
            , fileSystem = fileSystem
            , fileSearchInput = ""
            , shortcutKeysAreActive = True
            , addRemoveVerticesAndEdges = AddRemoveVerticesAndEdges.initialModel
            , vertexSelector = SelectAndEdit.initialModel
            , randomGraph = RandomGraph.initialModel
            , d3Force = D3Force.initialModel
            , panZoom = PanZoom.initialModel
            }
    in
        ( initialModel
        , Cmd.batch
            [ PageLayout.initialCmd |> Cmd.map FromLayout
            ]
        )



-- UPDATE


port setStorage : Value -> Cmd msg


port exportJsonPort : String -> Cmd msg


type Msg
    = NoOp
    | FromD3Force D3Force.Msg
    | FromAddRemoveVerticesAndEdges AddRemoveVerticesAndEdges.Msg
    | FromSelectAndEdit SelectAndEdit.Msg
    | FromWidgets Widgets.Msg
    | FromRandomGraph RandomGraph.Msg
    | FromFileSystem (FileSystem.Msg Digraph.Model)
    | FromLayout PageLayout.Msg
    | FromPanZoom PanZoom.Msg
    | ToggleWelcomeWindow
    | UpdateFileSearchInput String
    | ActivateShortcuts
    | DeactivateShortcuts
    | TogglePresentationMode


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ widgets, vertexSelector, fileSystem, addRemoveVerticesAndEdges, layout, panZoom, randomGraph, fileSystemIsVisible } as model) =
    let
        handleFileSystemMsg fileSystemMsg =
            let
                ( newFileSystem, call ) =
                    fileSystem |> FileSystem.update fileSystemMsg

                newModel =
                    { model | fileSystem = newFileSystem }

                filesystemAsValue =
                    newFileSystem
                        |> FileSystem.Json.Encode.encode Digraph.Json.Encode.encodeDigraph

                cmds =
                    case call of
                        FileSystem.UploadToLocalStorage ->
                            [ setStorage filesystemAsValue ]

                        FileSystem.ExportFileSystemAsJson ->
                            let
                                str =
                                    Json.Encode.encode 2 filesystemAsValue
                            in
                                [ exportJsonPort ("data:application/json;charset=utf-8," ++ str) ]

                        otherwise ->
                            []
            in
                newModel ! cmds
    in
        case model.fileSystem.state of
            FileSystem.WaitingForFileNameInputForNewFile ->
                case msg of
                    FromFileSystem fileSystemMsg ->
                        handleFileSystemMsg fileSystemMsg

                    otherwise ->
                        model ! []

            FileSystem.WaitingForFileNameInputForSaveAs _ ->
                case msg of
                    FromFileSystem fileSystemMsg ->
                        handleFileSystemMsg fileSystemMsg

                    otherwise ->
                        model ! []

            FileSystem.Idle ->
                case msg of
                    NoOp ->
                        model ! []

                    FromD3Force fromD3ForceMsg ->
                        let
                            ( maybeDigraphMsg, cmd, callToFileSystem ) =
                                case FileSystem.maybePresentOfTheFocused fileSystem of
                                    Nothing ->
                                        Debug.crash ""

                                    Just graph ->
                                        D3Force.update fromD3ForceMsg graph

                            newModel =
                                { model
                                    | fileSystem =
                                        fileSystem
                                            |> (case maybeDigraphMsg of
                                                    Nothing ->
                                                        identity

                                                    Just digraphMsg ->
                                                        FileSystem.editFocusedFileWithoutChangingHistoryAndPresentHash (Digraph.update digraphMsg)
                                               )
                                            |> case callToFileSystem of
                                                D3Force.PauseRecording ->
                                                    FileSystem.startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash

                                                D3Force.NoCall ->
                                                    identity

                                                D3Force.ResumeRecording ->
                                                    FileSystem.endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash
                                }
                        in
                            newModel ! [ cmd ]

                    FromAddRemoveVerticesAndEdges addRemoveVerticesAndEdgesMsg ->
                        let
                            ( newAddRemoveVerticesAndEdges, maybeDigraphMsg ) =
                                case FileSystem.maybePresentOfTheFocused fileSystem of
                                    Nothing ->
                                        Debug.crash ""

                                    Just graph ->
                                        addRemoveVerticesAndEdges |> AddRemoveVerticesAndEdges.update addRemoveVerticesAndEdgesMsg graph

                            newModel =
                                { model
                                    | addRemoveVerticesAndEdges = newAddRemoveVerticesAndEdges
                                    , fileSystem =
                                        case maybeDigraphMsg of
                                            -- This is necessary, because otherwise filesystem undo-redo dose not work properly.
                                            Nothing ->
                                                fileSystem

                                            Just digraphMsg ->
                                                fileSystem |> FileSystem.editFocusedFile (Digraph.update digraphMsg)
                                }
                        in
                            newModel ! []

                    FromSelectAndEdit vertexSelectorMsg ->
                        let
                            ( newSelectAndEdit, maybeDigraphMsg, callToFileSystem ) =
                                case FileSystem.maybePresentOfTheFocused fileSystem of
                                    Nothing ->
                                        Debug.crash ""

                                    Just graph ->
                                        vertexSelector |> SelectAndEdit.update vertexSelectorMsg graph

                            newFileSystem =
                                fileSystem
                                    |> case ( maybeDigraphMsg, callToFileSystem, vertexSelector.state ) of
                                        ( Nothing, SelectAndEdit.PauseRecording, _ ) ->
                                            FileSystem.startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash

                                        ( Nothing, SelectAndEdit.ResumeRecording, _ ) ->
                                            FileSystem.endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash

                                        ( Just digraphMsg, _, SelectAndEdit.DraggingVertices _ ) ->
                                            FileSystem.editFocusedFileWithoutChangingHistoryAndPresentHash (Digraph.update digraphMsg)

                                        ( Just digraphMsg, _, SelectAndEdit.Animating _ ) ->
                                            FileSystem.editFocusedFileWithoutChangingHistoryAndPresentHash (Digraph.update digraphMsg)

                                        ( Just digraphMsg, _, _ ) ->
                                            FileSystem.editFocusedFile (Digraph.update digraphMsg)

                                        ( Nothing, _, _ ) ->
                                            identity

                            newModel =
                                { model
                                    | vertexSelector = newSelectAndEdit
                                    , fileSystem = newFileSystem
                                }
                        in
                            newModel ! []

                    FromWidgets widgetsMsg ->
                        let
                            newWidgets =
                                model.widgets |> Widgets.update widgetsMsg

                            newModel =
                                { model | widgets = newWidgets }
                        in
                            newModel ! []

                    FromRandomGraph randomDiGraphMsg ->
                        let
                            ( cmd, maybeRandomAbsGraph ) =
                                randomGraph |> RandomGraph.update randomDiGraphMsg

                            maybeNewGraph =
                                maybeRandomAbsGraph
                                    |> Maybe.map Digraph.Generators.Basic.fromAbstractDigraph

                            newFileSystem =
                                case maybeNewGraph of
                                    Nothing ->
                                        fileSystem

                                    Just generatedGraph ->
                                        fileSystem
                                            |> FileSystem.newFile "~/random graph" generatedGraph

                            newModel =
                                { model | fileSystem = newFileSystem }
                        in
                            newModel ! [ Cmd.map FromRandomGraph cmd ]

                    FromFileSystem fileSystemMsg ->
                        handleFileSystemMsg fileSystemMsg

                    FromLayout layoutMsg ->
                        let
                            newModel =
                                { model | layout = layout |> PageLayout.update layoutMsg }
                        in
                            newModel ! []

                    FromPanZoom panZoomMsg ->
                        case fileSystem |> FileSystem.maybePresentOfTheFocused of
                            Nothing ->
                                model ! []

                            Just graph ->
                                let
                                    ( newPanZoom, maybePanAndZoom, callToFileSystem ) =
                                        PanZoom.update panZoomMsg panZoom graph.scaleAndTranslate

                                    newModel =
                                        { model
                                            | panZoom = newPanZoom
                                            , fileSystem =
                                                fileSystem
                                                    |> (case callToFileSystem of
                                                            PanZoom.PauseRecording ->
                                                                FileSystem.startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash

                                                            PanZoom.ResumeRecording ->
                                                                FileSystem.endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash

                                                            PanZoom.NoCall ->
                                                                identity
                                                       )
                                                    |> case maybePanAndZoom of
                                                        Nothing ->
                                                            identity

                                                        Just m ->
                                                            FileSystem.editFocusedFileWithoutChangingHistoryAndPresentHash (Digraph.update (Digraph.SetScaleAndTranslate m))
                                        }
                                in
                                    newModel ! []

                    ToggleWelcomeWindow ->
                        { model | welcomeWindowIsVisible = not model.welcomeWindowIsVisible } ! []

                    UpdateFileSearchInput str ->
                        { model | fileSearchInput = str } ! []

                    ActivateShortcuts ->
                        { model | shortcutKeysAreActive = True } ! []

                    DeactivateShortcuts ->
                        { model | shortcutKeysAreActive = False } ! []

                    TogglePresentationMode ->
                        { model | fileSystemIsVisible = not fileSystemIsVisible } ! []



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    let
        generalSubs =
            case model.fileSystem |> FileSystem.maybePresentOfTheFocused of
                Nothing ->
                    []

                Just graph ->
                    if model.shortcutKeysAreActive then
                        [ D3Force.subscriptions |> Sub.map FromD3Force
                        , Keyboard.downs
                            (\keyCode ->
                                let
                                    k =
                                        Char.fromCode keyCode
                                in
                                    if k == 'P' then
                                        ToggleWelcomeWindow
                                    else if k == 'V' then
                                        TogglePresentationMode
                                    else if k == 'Z' then
                                        FromFileSystem FileSystem.UndoInFocusedFile
                                    else if k == 'Y' then
                                        FromFileSystem FileSystem.RedoInFocusedFile
                                    else
                                        NoOp
                            )
                        ]
                    else
                        []

        widgetsSubs =
            case model.fileSystem |> FileSystem.maybePresentOfTheFocused of
                Nothing ->
                    []

                Just graph ->
                    case model.widgets.maybeNameOfTheActiveWidget of
                        {- This part of the code is highly vulnarable to bugs,
                           because names of the widgets must be written correctly.
                           Doing it this way, was a tradeoff for keeping things modular.
                        -}
                        Just "Add/Remove" ->
                            [ AddRemoveVerticesAndEdges.subscriptions graph model.addRemoveVerticesAndEdges
                                |> Sub.map FromAddRemoveVerticesAndEdges
                            ]

                        Just "Select and Edit" ->
                            [ SelectAndEdit.subscriptions model.vertexSelector graph.scaleAndTranslate
                                |> Sub.map FromSelectAndEdit
                            ]

                        Just "Pan and Zoom" ->
                            [ PanZoom.subscriptions model.panZoom
                                |> Sub.map FromPanZoom
                            ]

                        otherwise ->
                            []
    in
        Sub.batch
            (generalSubs
                ++ widgetsSubs
                ++ [ PageLayout.subscriptions |> Sub.map FromLayout
                   , FileSystem.subscriptions model.fileSystem |> Sub.map FromFileSystem
                   ]
            )



-- VIEW


view : Model -> Html Msg
view ({ widgets, addRemoveVerticesAndEdges, fileSystem, fileSearchInput, randomGraph, layout, vertexSelector, fileSystemIsVisible, panZoom } as model) =
    let
        displayIf condition =
            ( "display"
            , if condition then
                "block"
              else
                "none"
            )

        ------------------- FOLDERTREE ON THE LEFT ------------------
        viewLeftBar =
            div
                [ style
                    (( "background-color", "#262626" )
                        :: PageLayout.dimensions layout.leftBar
                    )
                ]
                [ viewFileSearchBar
                , viewFileControlButtons
                , viewFolderTreeViz
                ]

        viewFileControlButtons =
            Html.map FromFileSystem (FileSystem.View.ControlButtons.view fileSystem)

        viewFileSearchBar =
            Html.input
                [ Html.Events.onInput UpdateFileSearchInput
                , Html.Attributes.placeholder "Search Files"
                , Html.Attributes.id "file-searchbar"
                , Html.Events.onBlur ActivateShortcuts
                , Html.Events.onFocus DeactivateShortcuts
                , Html.Attributes.style
                    [ ( "background", "#1f2326" )
                    , ( "width", "210px" )
                    , ( "height", "14px" )
                    , ( "padding", "10px" )
                    , ( "margin", "10px" )
                    , ( "border-style", "none" )
                    , ( "color", "#d4d7d6" )
                    ]
                ]
                []

        viewFolderTreeViz =
            div
                [ style
                    [ ( "color", "#d3d3d3" )
                    , ( "overflow", "scroll" )
                    , ( "height", toString (layout.rightBar.height - 200) ++ "px" )
                    ]
                ]
                [ Html.map FromFileSystem (FileSystem.View.FolderTree.view fileSearchInput fileSystem) ]

        -------------------- WELCOME WINDOW IN THE MIDDLE----------------------
        viewWelcomeWindow =
            div
                [ style [ displayIf model.welcomeWindowIsVisible ] ]
                [ div
                    [ style <|
                        PageLayout.dimensions layout.browserWindow
                            ++ [ ( "background-color", "red" ), ( "opacity", "0" ) ]
                    , Html.Events.onMouseDown ToggleWelcomeWindow
                    ]
                    []
                , WelcomeWindow.view (PageLayout.dimensions layout.welcomeWindow)
                ]

        -------------------- GRAPH IN THE MIDDLE----------------------
        viewGraphWithWidgetOnGraphLayout =
            Svg.svg
                [ style <|
                    List.append
                        (PageLayout.dimensions layout.graphSvg)
                        [ ( "background-color", "#2e2e2e" ) ]
                ]
                (fileSystem
                    |> FileSystem.doIfFocusedExists
                        (\graph -> Digraph.view graph :: viewWidgetOnGraphLayout graph)
                        []
                )

        sizes =
            { layoutWidth = layout.graphSvg.width
            , layoutHeight = layout.graphSvg.height
            }

        viewWidgetOnGraphLayout graph =
            case widgets.maybeNameOfTheActiveWidget of
                Just "Add/Remove" ->
                    [ Html.map FromAddRemoveVerticesAndEdges (AddRemoveVerticesAndEdges.view addRemoveVerticesAndEdges graph sizes) ]

                Just "Select and Edit" ->
                    [ Html.map FromSelectAndEdit (SelectAndEdit.view model.vertexSelector graph sizes) ]

                Just "Pan and Zoom" ->
                    [ Html.map FromPanZoom (PanZoom.view panZoom sizes) ]

                otherwise ->
                    []

        -------------------- TABS ON TOP ------------------------
        viewTabs =
            div [ style (PageLayout.dimensions layout.tabsBar) ]
                [ Html.map FromFileSystem (FileSystem.View.Tabs.view fileSystem) ]

        -------------------- WIDGETS ON THE RIGHT ------------------------
        viewWidgets =
            div
                [ style <|
                    List.append
                        (PageLayout.dimensions layout.rightBar)
                        [ ( "background-color", "#262626" ) ]
                ]
                [ viewWidgetsSearchBar
                , viewMenus
                ]

        viewWidgetsSearchBar =
            Html.input
                [ Html.Events.onInput (Widgets.Filter >> FromWidgets)
                , Html.Attributes.placeholder "Search Widgets"
                , Html.Events.onBlur ActivateShortcuts
                , Html.Events.onFocus DeactivateShortcuts
                , Html.Attributes.id "widget-searchbar"
                , Html.Attributes.style
                    [ ( "background", "#1f2326" )
                    , ( "width", "210px" )
                    , ( "height", "14px" )
                    , ( "padding", "10px" )
                    , ( "margin", "10px" )
                    , ( "border-style", "none" )
                    , ( "color", "#d4d7d6" )
                    ]
                ]
                []

        helperDict =
            Dict.fromList
                [ ( AddRemoveVerticesAndEdges.widgetName, Html.map FromAddRemoveVerticesAndEdges (AddRemoveVerticesAndEdges.viewMenu addRemoveVerticesAndEdges) )
                , ( SelectAndEdit.widgetName, Html.map FromSelectAndEdit (SelectAndEdit.viewMenu vertexSelector) )
                , ( RandomGraph.widgetName, Html.map FromRandomGraph (RandomGraph.viewMenu randomGraph) )
                , ( D3Force.widgetName, Html.map FromD3Force D3Force.viewMenu )
                , ( PanZoom.widgetName, Html.map FromPanZoom (PanZoom.viewMenu panZoom) )
                ]

        viewMenus : Html Msg
        viewMenus =
            div
                [ Html.Attributes.style
                    [ ( "overflow", "scroll" )
                    , ( "height", toString (layout.rightBar.height - 54) ++ "px" )
                    ]
                ]
                (helperDict
                    |> Dict.map (\k v -> viewMenu k v)
                    |> Dict.values
                )

        viewMenu : String -> Html Msg -> Html Msg
        viewMenu widgetName widgetMenu =
            let
                isActive =
                    widgets.maybeNameOfTheActiveWidget == Just widgetName

                isExpanded =
                    case widgets.widgetDict |> Dict.get widgetName of
                        Just w ->
                            w.expanded

                        Nothing ->
                            Debug.crash ""

                viewMenuHeader widgetName =
                    div
                        [ Html.Attributes.style [ ( "padding", "10px" ) ]
                        , Html.Events.onMouseDown
                            (if isActive || not isExpanded then
                                FromWidgets (Widgets.SwitchExpanded widgetName)
                             else
                                NoOp
                            )
                        ]
                        [ Html.text widgetName ]

                viewMenuContent widgetMenu =
                    div
                        [ Html.Attributes.style
                            [ ( "padding", "10px" )
                            , ( "min-height", "50px" )
                            , displayIf isExpanded
                            ]
                        ]
                        [ widgetMenu ]
            in
                div
                    [ Html.Events.onMouseDown (FromWidgets (Widgets.Activate widgetName))
                    , Html.Attributes.style
                        [ ( "background", "#2e2e2e" )
                        , ( "width", "230px" )
                        , ( "padding", "0px" )
                        , ( "margin", "10px" )
                        , ( "border", "0px" )
                        , ( "color", "#d4d7d6" )
                        , ( "opacity"
                          , if isActive then
                                "1"
                            else
                                "0.2"
                          )
                        , case widgets.widgetDict |> Dict.get widgetName of
                            Just w ->
                                displayIf w.visible

                            Nothing ->
                                Debug.crash ""
                        ]
                    ]
                    [ viewMenuHeader widgetName
                    , viewMenuContent widgetMenu
                    ]

        -------------------- BAR AT THE BOTTOM ------------------------
        viewBottomBar =
            div
                [ style <|
                    (PageLayout.dimensions layout.bottomBar)
                        ++ [ ( "background-color", "#1e1e1e" )
                           , ( "padding", "0px 20px 0px 20px" )
                           , displayIf
                                (case fileSystem.state of
                                    FileSystem.WaitingForFileNameInputForNewFile ->
                                        True

                                    FileSystem.WaitingForFileNameInputForSaveAs _ ->
                                        True

                                    otherwise ->
                                        False
                                )
                           ]
                ]
                [ Html.map FromFileSystem (FileSystem.InputFileName.view fileSystem) ]
    in
        div
            [ style (List.append CssHelpers.unselectable [ ( "cursor", "default" ) ]) ]
            [ viewGraphWithWidgetOnGraphLayout
            , if fileSystemIsVisible then
                div [] []
              else
                viewTabs
            , if fileSystemIsVisible then
                div [] []
              else
                viewLeftBar
            , viewWidgets
            , viewWelcomeWindow
            , viewBottomBar
            ]
