module FileArray exposing (FileArray)

{- Two files are allowed to have the same name.
   Here, the order of the files are going to distinguish them
-}

import Array exposing (Array)
import UndoList as UL exposing (UndoList)


type FileArray f
    = FileArray
        { activeIndex : Maybe FileIndex
        , fileArray : Array (File f)
        }


type alias FileIndex =
    Int


type alias File f =
    { name : String
    , isOpen : Bool
    , file : UndoList f
    }



-- QUERIES


empty : FileArray f
empty =
    FileArray
        { activeIndex = Nothing
        , fileArray = Array.empty
        }


{-| Saves to active index. We assume that only the item in the active index can is shown to the user, hence, saving will overwrite the existing one
-}
save : String -> f -> FileArray f -> FileArray f
save name file fL =
    -- TODO
    fL


insertAt : File f -> Int -> FileArray f -> FileArray f
insertAt file i fL =
    -- TODO
    fL
