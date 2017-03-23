module FileSystem.Json.Decode exposing (fileSystemDecoder)

import Dict exposing (Dict)
import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (..)
import UndoList.Decode
import UndoList as UL
import FileSystem exposing (..)


fileSystemDecoder : Decoder a -> Decoder (FileSystem.Model a)
fileSystemDecoder fileDecoder =
    decode FileSystem.Model
        |> required "allFilesWithHashes" (allFilesWithHashesDecoder fileDecoder)
        |> required "allFolders" allFoldersDecoder
        |> required "openedFiles" (openedFilesDecoder fileDecoder)
        |> required "openedFilesOrderedForTabs" (list string)
        |> required "maybePathOfTheFocusedFile" (maybe string)
        |> hardcoded {- locked -} False
        |> required "emptyFile" fileDecoder
        |> required "userInputForNewFile" string
        |> hardcoded {- state -} Idle


allFilesWithHashesDecoder : Decoder a -> Decoder (Dict Path (FileWithHash a))
allFilesWithHashesDecoder fileDecoder =
    pathAndFileWithHashDecoder fileDecoder
        |> map (\{ path, fileWithHash } -> ( path, fileWithHash ))
        |> list
        |> map Dict.fromList


type alias PathAndFileWithHash a =
    { path : Path
    , fileWithHash : FileWithHash a
    }


pathAndFileWithHashDecoder : Decoder a -> Decoder (PathAndFileWithHash a)
pathAndFileWithHashDecoder fileDecoder =
    decode PathAndFileWithHash
        |> required "path" string
        |> required "fileWithHash" (fileWithHashDecoder fileDecoder)


fileWithHashDecoder : Decoder a -> Decoder (FileWithHash a)
fileWithHashDecoder fileDecoder =
    decode FileWithHash
        |> required "file" fileDecoder
        |> required "hash" int



-------------------------------------------------


allFoldersDecoder : Decoder (Dict Path Directory)
allFoldersDecoder =
    pathAndFolderDecoder
        |> map (\{ path, folder } -> ( path, folder ))
        |> list
        |> map Dict.fromList


type alias PathAndFolder =
    { path : Path
    , folder : Directory
    }


pathAndFolderDecoder : Decoder PathAndFolder
pathAndFolderDecoder =
    decode PathAndFolder
        |> required "path" string
        |> required "folder" folderDecoder


folderDecoder : Decoder Directory
folderDecoder =
    decode Directory
        |> required "isOpen" bool



-----------------------------------------


type alias UndoListOfFileWithHash a =
    UL.UndoList (FileWithHash a)


openedFilesDecoder : Decoder a -> Decoder (Dict Path (UndoListOfFileWithHash a))
openedFilesDecoder fileDecoder =
    pathAndUndoListOfFileWithHashPairDecoder fileDecoder
        |> map (\{ path, undoListOfFileWithHash } -> ( path, undoListOfFileWithHash ))
        |> list
        |> map Dict.fromList


type alias PathAndUndoListOfFileWithHashPair a =
    { path : Path
    , undoListOfFileWithHash : UndoListOfFileWithHash a
    }


pathAndUndoListOfFileWithHashPairDecoder : Decoder a -> Decoder (PathAndUndoListOfFileWithHashPair a)
pathAndUndoListOfFileWithHashPairDecoder fileDecoder =
    decode PathAndUndoListOfFileWithHashPair
        |> required "path" string
        |> required "undoListOfFileWithHash" (undoListOfFileWithHashDecoder fileDecoder)


undoListOfFileWithHashDecoder : Decoder a -> Decoder (UndoListOfFileWithHash a)
undoListOfFileWithHashDecoder fileDecoder =
    UndoList.Decode.undolist (fileWithHashDecoder fileDecoder)
