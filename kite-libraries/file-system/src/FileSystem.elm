module FileSystem exposing (..)

import Dict exposing (Dict)
import FNV
import UndoList as UL
import Keyboard


-- TODO: Prevent paths like "folder1//content1", "folder1/folder2/" or "b/31/////234/"
-- MODEL


type alias Model a =
    { allFilesWithHashes : Dict Path (FileWithHash a)
    , allFolders : Dict Path Directory
    , openedFiles : Dict Path (UL.UndoList (FileWithHash a))
    , openedFilesOrderedForTabs : List Path
    , maybePathOfTheFocusedFile : Maybe Path
    , locked : Bool {- If True, it does not do any updates. Useful when you need to lock the user interaction with the file system. -}
    , emptyFile : a
    , userInputForNewFile : String
    , state : State
    }


type State
    = WaitingForFileNameInputForNewFile
    | WaitingForFileNameInputForSaveAs Path
    | Idle


type alias Path =
    String


type alias FileWithHash a =
    { file : a
    , hash : Hash
    }


type alias Hash =
    Int


type alias Directory =
    { isOpen : Bool }


init : a -> Model a
init emptyFile =
    { allFilesWithHashes = Dict.empty
    , allFolders = Dict.empty
    , openedFiles = Dict.empty
    , openedFilesOrderedForTabs = []
    , maybePathOfTheFocusedFile = Nothing
    , locked = False
    , emptyFile = emptyFile
    , userInputForNewFile = ""
    , state = Idle
    }



-- helpers


{-| TODO : Do this with Result type: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Result
-}
takeName : Path -> String
takeName path =
    path
        |> String.split "/"
        |> List.reverse
        |> List.head
        |> Maybe.withDefault "ERROR READING FILENAME"



--getters


maybePresentOfTheFocused : Model a -> Maybe a
maybePresentOfTheFocused ({ openedFiles, maybePathOfTheFocusedFile } as model) =
    case maybePathOfTheFocusedFile of
        Nothing ->
            Nothing

        Just pathOfTheFocusedFile ->
            case openedFiles |> Dict.get pathOfTheFocusedFile of
                Nothing ->
                    Debug.crash "Focused file must be opened!"

                Just undoList ->
                    Just undoList.present.file


doIfFocusedExists : (a -> b) -> b -> Model a -> b
doIfFocusedExists f default model =
    maybePresentOfTheFocused model
        |> Maybe.map f
        |> Maybe.withDefault default


getAllFilePaths : Model a -> List Path
getAllFilePaths model =
    model.allFilesWithHashes
        |> Dict.keys


getAllFolderPaths : Model a -> List Path
getAllFolderPaths model =
    model.allFolders
        |> Dict.keys



-- queries


hasChanged : Path -> Model a -> Bool
hasChanged path model =
    case
        ( model.allFilesWithHashes |> Dict.get path
        , model.openedFiles |> Dict.get path
        )
    of
        ( Just { hash }, Just undoList ) ->
            hash /= undoList.present.hash

        otherwise ->
            Debug.crash "The given path is not an open file."


isOpenedFile : Path -> Model a -> Bool
isOpenedFile path { openedFiles } =
    openedFiles |> Dict.member path


getUserInputForNewFile : Model a -> String
getUserInputForNewFile model =
    model.userInputForNewFile



-- setters


stopAskingForFileName : Model a -> Model a
stopAskingForFileName model =
    { model | state = Idle }


setLocked : Bool -> Model a -> Model a
setLocked bool model =
    { model | locked = bool }


saveFileWithHash : Path -> FileWithHash a -> Model a -> Model a
saveFileWithHash path fileWithHash model =
    let
        takePrefixes l =
            List.range 1 (List.length l - 1)
                |> List.map (\i -> List.take i l)
                |> List.map (String.join "/")

        folderPathsToAdd =
            path |> String.split "/" |> takePrefixes
    in
        { model
            | allFilesWithHashes =
                model.allFilesWithHashes
                    |> Dict.insert path fileWithHash
            , allFolders =
                model.allFolders
                    |> Dict.union
                        (folderPathsToAdd
                            |> List.map (\p -> ( p, { isOpen = True } ))
                            |> Dict.fromList
                        )
        }


updateFocusedUL : (UL.UndoList (FileWithHash a) -> UL.UndoList (FileWithHash a)) -> Model a -> Model a
updateFocusedUL f ({ openedFiles, maybePathOfTheFocusedFile } as model) =
    case maybePathOfTheFocusedFile of
        Nothing ->
            Debug.crash ""

        Just pathOfTheFocusedFile ->
            { model | openedFiles = openedFiles |> Dict.update pathOfTheFocusedFile (Maybe.map f) }


focusFile : Path -> Model a -> Model a
focusFile path model =
    { model | maybePathOfTheFocusedFile = Just path }


openFile : Path -> Model a -> Model a
openFile path model =
    case model.allFilesWithHashes |> Dict.get path of
        Just { file, hash } ->
            let
                newOpenedFiles =
                    if isOpenedFile path model then
                        model.openedFiles
                    else
                        model.openedFiles
                            |> Dict.insert path
                                (UL.fresh { file = file, hash = hash })
            in
                { model
                    | openedFiles = newOpenedFiles
                    , openedFilesOrderedForTabs =
                        if List.member path model.openedFilesOrderedForTabs then
                            model.openedFilesOrderedForTabs
                        else
                            List.append model.openedFilesOrderedForTabs [ path ]
                }

        otherwise ->
            Debug.crash ""


newFile : Path -> a -> Model a -> Model a
newFile path file model =
    let
        hash =
            file |> toString |> FNV.hashString

        -- TODO:
        --check if the path is valid : String -> Result ...
    in
        model
            |> saveFileWithHash path { file = file, hash = hash }
            |> openFile path
            |> focusFile path


deleteFocusedFile : Model a -> Model a
deleteFocusedFile model =
    case model.maybePathOfTheFocusedFile of
        Just path ->
            let
                m =
                    model
                        |> closeFile path
            in
                { m | allFilesWithHashes = m.allFilesWithHashes |> Dict.remove path }

        Nothing ->
            model


closeFile : Path -> Model a -> Model a
closeFile path model =
    let
        {- For example :
           beforeAndAfter '45' [3, 410, 45, 12, 34] outputs ([3, 410], [12, 34])
        -}
        --beforeAndAfter : a -> List a -> ( List a, List a )
        beforeAndAfter e l =
            let
                --helper : List a -> List a -> ( List a, List a )
                helper bef aft =
                    case aft of
                        h :: tail ->
                            if h == e then
                                ( List.reverse bef, tail )
                            else
                                helper (h :: bef) tail

                        [] ->
                            ( bef, aft )
            in
                helper [] l

        ( tabsBefore, tabsAfter ) =
            beforeAndAfter path model.openedFilesOrderedForTabs
    in
        { model
            | openedFiles = model.openedFiles |> Dict.remove path
            , openedFilesOrderedForTabs = tabsBefore ++ tabsAfter
            , maybePathOfTheFocusedFile =
                case model.maybePathOfTheFocusedFile of
                    Nothing ->
                        Nothing

                    Just str ->
                        if str /= path then
                            Just str
                        else
                            case tabsBefore |> List.reverse |> List.head of
                                Nothing ->
                                    List.head tabsAfter

                                Just tab ->
                                    Just tab
        }


editFocusedFile : (a -> a) -> (Model a -> Model a)
editFocusedFile updater =
    updateFocusedUL
        (\ul ->
            let
                updatedContent =
                    updater ul.present.file
            in
                ul
                    |> UL.new
                        { file = updatedContent
                        , hash = updatedContent |> toString |> FNV.hashString
                        }
        )


startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash : Model a -> Model a
startOfEditingFocusedFileWithoutChangingHistoryAndPresentHash =
    updateFocusedUL
        (\ul -> ul |> UL.new ul.present)
        >> setLocked True


editFocusedFileWithoutChangingHistoryAndPresentHash : (a -> a) -> Model a -> Model a
editFocusedFileWithoutChangingHistoryAndPresentHash updater =
    updateFocusedUL
        (UL.mapPresent (\entry -> { entry | file = updater entry.file }))


endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash : Model a -> Model a
endOfEditingFocusedFileWithoutChangingHistoryAndPresentHash =
    updateFocusedUL
        (UL.mapPresent (\entry -> { entry | hash = entry.file |> toString |> FNV.hashString }))
        >> setLocked False


openCloseFolder : Path -> Model a -> Model a
openCloseFolder path ({ allFolders } as model) =
    let
        newAllFolders =
            allFolders |> Dict.update path (Maybe.map (\f -> { f | isOpen = not f.isOpen }))
    in
        { model | allFolders = newAllFolders }


redoInFocusedFile : Model a -> Model a
redoInFocusedFile =
    updateFocusedUL UL.redo


undoInFocusedFile : Model a -> Model a
undoInFocusedFile =
    updateFocusedUL UL.undo



---- UPDATE


type Msg a
    = NoOp
    | OpenAndFocusFile Path
    | CloseFile Path
    | CloseFocusedFile
    | NewFile Path a
    | DeleteFocusedFile
    | FocusFile Path
    | SaveFocusedFile
    | UndoInFocusedFile
    | RedoInFocusedFile
    | UpdateUserInputForNewFileName String
    | OpenCloseFolder Path
    | AskForFileNameForNewFile
    | AskForFileNameForSaveAs
    | StopAskingForFileName
    | Export


type CallToParent
    = NoCall
    | UploadToLocalStorage
    | ExportFileSystemAsJson


update : Msg a -> Model a -> ( Model a, CallToParent )
update msg model =
    let
        newModel =
            updateHelper msg model
    in
        case msg of
            SaveFocusedFile ->
                ( newModel, UploadToLocalStorage )

            Export ->
                ( newModel, ExportFileSystemAsJson )

            otherwise ->
                ( newModel, NoCall )


updateHelper : Msg a -> Model a -> Model a
updateHelper msg ({ allFilesWithHashes, openedFiles, maybePathOfTheFocusedFile, openedFilesOrderedForTabs, locked } as model) =
    if model.locked then
        model
    else
        case msg of
            NoOp ->
                model

            OpenAndFocusFile path ->
                model
                    |> openFile path
                    |> focusFile path

            CloseFile path ->
                model |> closeFile path

            CloseFocusedFile ->
                case maybePathOfTheFocusedFile of
                    Nothing ->
                        Debug.crash ""

                    Just path ->
                        model |> closeFile path

            NewFile path file ->
                model |> newFile path file |> stopAskingForFileName

            DeleteFocusedFile ->
                model |> deleteFocusedFile

            FocusFile path ->
                model |> focusFile path

            SaveFocusedFile ->
                case maybePathOfTheFocusedFile of
                    Nothing ->
                        Debug.crash ""

                    Just path ->
                        case openedFiles |> Dict.get path of
                            Nothing ->
                                Debug.crash ""

                            Just undoList ->
                                model |> saveFileWithHash path undoList.present

            UndoInFocusedFile ->
                model |> undoInFocusedFile

            RedoInFocusedFile ->
                model |> redoInFocusedFile

            OpenCloseFolder path ->
                model |> openCloseFolder path

            AskForFileNameForNewFile ->
                { model | state = WaitingForFileNameInputForNewFile }

            AskForFileNameForSaveAs ->
                { model
                    | state =
                        case model.maybePathOfTheFocusedFile of
                            Just path ->
                                WaitingForFileNameInputForSaveAs path

                            Nothing ->
                                Idle
                }

            UpdateUserInputForNewFileName str ->
                { model | userInputForNewFile = str }

            StopAskingForFileName ->
                model |> stopAskingForFileName

            Export ->
                model



-- SUBSCRIPTIONS


subscriptions : Model a -> Sub (Msg a)
subscriptions model =
    Keyboard.downs
        (\keyCode ->
            if keyCode == 13 then
                -- enter
                case model.state of
                    WaitingForFileNameInputForNewFile ->
                        NewFile model.userInputForNewFile model.emptyFile

                    WaitingForFileNameInputForSaveAs pathOfTheFileToBeCopied ->
                        case Dict.get pathOfTheFileToBeCopied model.allFilesWithHashes of
                            Nothing ->
                                NewFile model.userInputForNewFile model.emptyFile

                            Just path ->
                                case model |> maybePresentOfTheFocused of
                                    Nothing ->
                                        NewFile model.userInputForNewFile model.emptyFile

                                    Just file ->
                                        NewFile model.userInputForNewFile file

                    Idle ->
                        NoOp
            else if keyCode == 27 then
                -- esc
                StopAskingForFileName
            else
                NoOp
        )



-- VIEW: is in separate Files
