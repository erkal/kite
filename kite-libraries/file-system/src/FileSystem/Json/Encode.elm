module FileSystem.Json.Encode exposing (encode)

import Dict exposing (Dict)
import Json.Encode as JE exposing (Value)
import UndoList.Encode
import UndoList as UL
import FileSystem exposing (..)


encodeMaybe : (a -> Value) -> Maybe a -> Value
encodeMaybe encoder maybeThing =
    case maybeThing of
        Nothing ->
            JE.null

        Just thing ->
            encoder thing



---------------------------------------------------
--type alias Model a =
--    { allFilesWithHashes : Dict Path (FileWithHash a)
--    , allFolders : Dict Path Directory
--    , openedFiles : Dict Path (UL.UndoList (FileWithHash a))
--    , openedFilesOrderedForTabs : List Path
--    , maybePathOfTheFocusedFile : Maybe Path
--    , locked : Bool
--    , emptyFile : a
--    , userInputForNewFile : String
--    }
--type alias Directory =
--    { isOpen : Bool }
--type alias FileWithHash a =
--    { file : a
--    , hash : Hash
--    }


encode : (a -> Value) -> FileSystem.Model a -> Value
encode encodeFile { allFilesWithHashes, allFolders, openedFiles, openedFilesOrderedForTabs, maybePathOfTheFocusedFile, locked, userInputForNewFile, emptyFile } =
    [ ( "allFilesWithHashes", encodeAllFilesWithHashes encodeFile allFilesWithHashes )
    , ( "allFolders", encodeAllFolders allFolders )
    , ( "openedFiles", encodeOpenedFiles encodeFile openedFiles )
    , ( "openedFilesOrderedForTabs", openedFilesOrderedForTabs |> List.map JE.string |> JE.list )
    , ( "maybePathOfTheFocusedFile", encodeMaybe JE.string maybePathOfTheFocusedFile )
    , ( "emptyFile", encodeFile emptyFile )
    , ( "userInputForNewFile", JE.string userInputForNewFile )
    ]
        |> JE.object



---------------------------


encodeAllFilesWithHashes : (a -> Value) -> Dict Path (FileWithHash a) -> Value
encodeAllFilesWithHashes encodeFile allFilesWithHashes =
    allFilesWithHashes
        |> Dict.toList
        |> List.map (encodeKeyValueFromAllFilesWithHashes encodeFile)
        |> JE.list


encodeKeyValueFromAllFilesWithHashes : (a -> Value) -> ( Path, FileWithHash a ) -> Value
encodeKeyValueFromAllFilesWithHashes encodeFile ( path, fileWithHash ) =
    [ ( "path", JE.string path )
    , ( "fileWithHash", encodeFileWithHash encodeFile fileWithHash )
    ]
        |> JE.object


encodeFileWithHash : (a -> Value) -> FileWithHash a -> Value
encodeFileWithHash encodeFile { file, hash } =
    [ ( "file", encodeFile file )
    , ( "hash", JE.int hash )
    ]
        |> JE.object



---------------------------


encodeAllFolders : Dict Path Directory -> Value
encodeAllFolders allFolders =
    allFolders
        |> Dict.toList
        |> List.map encodeKeyValueFromAllFolders
        |> JE.list


encodeKeyValueFromAllFolders : ( Path, Directory ) -> Value
encodeKeyValueFromAllFolders ( path, folder ) =
    [ ( "path", JE.string path )
    , ( "folder", encodeFolder folder )
    ]
        |> JE.object


encodeFolder : Directory -> Value
encodeFolder { isOpen } =
    [ ( "isOpen", JE.bool isOpen ) ]
        |> JE.object



---------------------------


encodeOpenedFiles : (a -> Value) -> Dict Path (UL.UndoList { file : a, hash : Hash }) -> Value
encodeOpenedFiles encodeFile openedFiles =
    openedFiles
        |> Dict.toList
        |> List.map (encodePairOfFileNameAndUndoListOfFileWithHash encodeFile)
        |> JE.list


encodePairOfFileNameAndUndoListOfFileWithHash : (a -> Value) -> ( Path, UL.UndoList { file : a, hash : Hash } ) -> Value
encodePairOfFileNameAndUndoListOfFileWithHash encodeFile ( path, undoListOfFileWithHash ) =
    [ ( "path", JE.string path )
    , ( "undoListOfFileWithHash", encodeUndoList encodeFile undoListOfFileWithHash )
    ]
        |> JE.object


encodeUndoList : (a -> Value) -> UL.UndoList (FileWithHash a) -> Value
encodeUndoList encodeFile =
    UL.map (encodeFileWithHash encodeFile) >> UndoList.Encode.undolist
