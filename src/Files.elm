module Files exposing
    ( Files
    , encode, decoder
    , singleton, newFile
    , focus
    , undo, redo, goToInHistory, new, mapPresent, save, delete, rename, duplicate, close
    , present, getName, hasFuture, hasPast, lengthPast, uLWSVizData
    , vizData
    , focusNext, focusPrevious
    )

{-| Represent an ordered nonempty list of files, each with unique names, keeping track of a focused file. It allows undo-redo operations on each file.
An example usage can be found in the source code of
[Kite](https://erkal.github.io/kite/).

It behaves similar to most editors, namely:

  - If a new file is added, it immediately gets the focus.
  - If a file is closed, the past and the future of the file gets lost, in the sense that undo and redo will not work directly after the file is refocused.

**Main restrictions:**

  - There is no folder structure.
  - There is no concept of "opening a file". Instead, `vizData` function exports a boolean field named `hasPast`.


# Definition

@docs Files


# Encoding and Decoding

@docs encode, decoder


# Constructors

@docs singleton, newFile


# Setting the Focus

@docs focus


# Operations on the Focused File

@docs undo, redo, goToInHistory, new, mapPresent, save, delete, rename, duplicate, close


# Queries to the Focused File

@docs present, getName, hasFuture, hasPast, lengthPast, uLWSVizData


# Exporting for View

@docs vizData

-}

import Files.UndoListWithSave as ULWS exposing (UndoListWithSave)
import Json.Decode as JD exposing (Decoder, Value)
import Json.Encode as JE exposing (Value)
import Set exposing (Set)


{-| Main data structure.
-}
type Files data
    = Files
        { before : List (File data)
        , focused : File data
        , after : List (File data)
        }


type File data
    = File Name (UndoListWithSave data)


type alias Name =
    String



-------------
-- Encoder --
-------------


encode : (data -> Value) -> Files data -> Value
encode encodeFileData (Files { before, focused, after }) =
    JE.object
        [ ( "before", JE.list (encodeFile encodeFileData) before )
        , ( "focused", encodeFile encodeFileData focused )
        , ( "after", JE.list (encodeFile encodeFileData) after )
        ]


encodeFile : (data -> Value) -> File data -> Value
encodeFile encodeFileData (File name uLWS) =
    JE.object
        [ ( "name", JE.string name )
        , ( "savedData", encodeFileData (ULWS.getSavedState uLWS) )
        ]



-------------
-- Decoder --
-------------


decoder : Decoder data -> Decoder (Files data)
decoder dataDecoder =
    JD.map3 (\b f a_ -> Files { before = b, focused = f, after = a_ })
        (JD.field "before" (JD.list (fileDecoder dataDecoder)))
        (JD.field "focused" (fileDecoder dataDecoder))
        (JD.field "after" (JD.list (fileDecoder dataDecoder)))


fileDecoder : Decoder data -> Decoder (File data)
fileDecoder dataDecoder =
    JD.map2 File
        (JD.field "name" JD.string)
        (JD.field "savedData" (JD.map ULWS.fresh dataDecoder))



------------------
-- Constructors --
------------------


{-| This is the only constructor.
-}
singleton : Name -> data -> Files data
singleton name data =
    Files
        { before = []
        , focused = File name (ULWS.fresh data)
        , after = []
        }


{-| Adds a new file just after the focused, the new file gets the focus.
-}
newFile : Name -> data -> Files data -> Files data
newFile name d ((Files { before, focused, after }) as files) =
    Files
        { before = focused :: before
        , focused = File (newNameFrom name files) (ULWS.fresh d)
        , after = after
        }



-----------------------
-- Setting the Focus --
-----------------------


{-| Given a name which is not the name of the focused file, returns files with the file with the given name focused.
-}
focus : Name -> Files data -> Files data
focus name ((Files { before, focused, after }) as files) =
    let
        hasTheNameToPick : File a -> Bool
        hasTheNameToPick (File name_ uLWS) =
            name_ == name
    in
    case pick hasTheNameToPick before of
        Just ( oldBeforeAfterNewFocused, newFocused, newBefore ) ->
            Files
                { before = newBefore
                , focused = newFocused
                , after =
                    oldBeforeAfterNewFocused ++ (focused :: after)
                }

        Nothing ->
            case pick hasTheNameToPick after of
                Just ( oldAfterBeforeNewFocused, newFocused, newAfter ) ->
                    Files
                        { before =
                            oldAfterBeforeNewFocused ++ (focused :: before)
                        , focused = newFocused
                        , after = newAfter
                        }

                Nothing ->
                    files



------------------------------------
-- Operations on the Focused File --
------------------------------------


undo : Files data -> Files data
undo =
    mapULWS ULWS.undo


redo : Files data -> Files data
redo =
    mapULWS ULWS.redo


goToInHistory : Int -> Files data -> Files data
goToInHistory i =
    mapULWS (ULWS.goTo i)


new : data -> Files data -> Files data
new newState =
    mapULWS (ULWS.new newState)


mapPresent : (data -> data) -> Files data -> Files data
mapPresent up =
    mapULWS (ULWS.mapPresent up)


save : Files data -> Files data
save =
    mapULWS ULWS.savePresent


{-| Deletes the focused file. It doesn't do anything if it is the last item in the list.
-}
delete : Files data -> Files data
delete ((Files { before, focused, after }) as files) =
    case before of
        f :: fs ->
            Files
                { before = fs
                , focused = f
                , after = after
                }

        [] ->
            files


rename : Name -> Files data -> Files data
rename newName files =
    map
        (\(File name arr) -> File (newNameFrom newName files) arr)
        files


duplicate : Files data -> Files data
duplicate files =
    newFile
        (newNameFrom (getName files ++ " copy") files)
        (present files)
        files


close : Files data -> Files data
close =
    mapULWS ULWS.resetToSaved


focusNext : Files data -> Files data
focusNext ((Files { before, focused, after }) as files) =
    case after of
        x :: xs ->
            Files
                { before = focused :: before
                , focused = x
                , after = xs
                }

        [] ->
            files


focusPrevious : Files data -> Files data
focusPrevious ((Files { before, focused, after }) as files) =
    case before of
        x :: xs ->
            Files
                { before = xs
                , focused = x
                , after = focused :: after
                }

        [] ->
            files



---------------------------------
-- Queries to the Focused File --
---------------------------------


{-| The present data of the focused File.
-}
present : Files data -> data
present =
    queryULWS ULWS.present


{-| The present data of the focused File.
-}
getName : Files data -> Name
getName (Files { focused }) =
    (\(File name _) -> name) focused


hasFuture : Files data -> Bool
hasFuture =
    queryULWS ULWS.hasFuture


hasPast : Files data -> Bool
hasPast =
    queryULWS ULWS.hasPast


lengthPast : Files data -> Int
lengthPast =
    queryULWS ULWS.lengthPast


uLWSVizData : Files data -> List data
uLWSVizData =
    queryULWS ULWS.vizData



------------------------
-- Exporting for View --
------------------------


type alias VizDatum =
    { name : Name
    , isTheFocused : Bool
    , edited : Bool
    , isOpened : Bool
    }


vizData : Files a -> List VizDatum
vizData (Files { before, focused, after }) =
    let
        datum isTheFocused (File name uLWS) =
            { name = name
            , isTheFocused = isTheFocused
            , edited = not (ULWS.presentIsTheLastSaved uLWS)
            , isOpened = ULWS.hasPast uLWS
            }
    in
    List.reverse (List.map (datum False) before)
        ++ (datum True focused :: List.map (datum False) after)



---------------
-- Internals --
---------------


queryULWS q (Files { focused }) =
    (\(File name uLWS) -> q uLWS) focused


mapULWS up =
    map (\(File name uLWS) -> File name (up uLWS))


map up (Files { before, focused, after }) =
    Files
        { before = before
        , focused = up focused
        , after = after
        }


newNameFrom : Name -> Files a -> Name
newNameFrom name (Files { before, focused, after }) =
    let
        allFiles =
            before ++ (focused :: after)

        allNames =
            allFiles
                |> List.map (\(File n _) -> n)
                |> Set.fromList

        try i =
            let
                nameToTry =
                    name ++ " " ++ String.fromInt i
            in
            if Set.member nameToTry allNames then
                try (i + 1)

            else
                nameToTry
    in
    if Set.member name allNames then
        try 1

    else
        name


{-| Pick an element satisfiying the check and returns also the elements to the left and to the right
-}
pick : (a -> Bool) -> List a -> Maybe ( List a, a, List a )
pick check l =
    let
        helper checked unchecked =
            case unchecked of
                x :: xs ->
                    if check x then
                        Just ( checked, x, xs )

                    else
                        helper (x :: checked) xs

                [] ->
                    Nothing
    in
    helper [] l
