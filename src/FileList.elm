module FileList exposing (FileList)


type FileList f
    = FileList (List (File f))


type alias File f =
    { name : String
    , file : f
    , editedFile : f
    }


empty : FileList f
empty =
    FileList []


saveFile : String -> f -> FileList f -> FileList f
saveFile name file fL =
    -- TODO
    fL


insertFileAt : File f -> Int -> FileList f -> FileList f
insertFileAt file i fL =
    fL
