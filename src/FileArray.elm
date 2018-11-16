module Files exposing (Files)

{- Two files are allowed to have the same name.
   Here, the order of the files are going to distinguish them
-}

import Array exposing (Array)
import UndoList as UL exposing (UndoList)


type Files f
    = Files
        { activeIndex : FileIndex
        , fileArray : Array (File f)
        }


type alias FileIndex =
    Int


type alias File f =
    { name : String
    , fileWithHistory : UndoList f
    }


getActiveIndex : Files f -> FileIndex
getActiveIndex (Files { activeIndex }) =
    activeIndex


hasChanged : File f -> Bool
hasChanged { fileWithHistory } =
    UL.hasPast fileWithHistory


empty : Files f
empty =
    Files
        { activeIndex = 0
        , fileArray = Array.empty
        }


newFile : String -> f -> Files f -> Files f
newFile name fileWithHistory fL =
    -- TODO
    fL


{-| Saves to active index. We assume that only the item in the active index can is shown to the user, hence, saving will overwrite the existing one
-}
save : String -> f -> Files f -> Files f
save name fileWithHistory fL =
    -- TODO
    fL


insertAt : File f -> Int -> Files f -> Files f
insertAt fileWithHistory i fL =
    -- TODO
    fL
