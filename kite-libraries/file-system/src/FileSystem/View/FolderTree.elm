port module FileSystem.View.FolderTree exposing (..)

import Color
import Dict exposing (Dict)
import Html exposing (Html, div, p, span)
import Html.Attributes exposing (style)
import Html.Events exposing (onMouseDown)
import Material.Icons.File as MIF
import Material.Icons.Content as MIC
import CssHelpers
import FileSystem exposing (..)


type Tree
    = Tree
        {- Directory -}
        { path : Path
        , isOpen : Bool
        , folderChildren : List Tree
        , fileChildren : List Tree
        }
    | Leaf {- File -} { path : Path }


treeFromFileSystem : Model file -> Tree
treeFromFileSystem fileSystem =
    let
        isChildPathOf path r =
            String.startsWith (path ++ "/") r
                && not
                    (String.contains "/"
                        (String.dropLeft (String.length path + 1) r)
                    )

        allFolderPaths =
            FileSystem.getAllFolderPaths fileSystem

        allFilePaths =
            fileSystem
                |> FileSystem.getAllFilePaths

        subtree path =
            let
                folderChildren =
                    allFolderPaths
                        |> List.filter (isChildPathOf path)
                        |> List.map subtree

                fileChildren =
                    allFilePaths
                        |> List.filter (isChildPathOf path)
                        |> List.map (\p -> Leaf { path = p })
            in
                Tree
                    { path = path
                    , isOpen =
                        case Dict.get path fileSystem.allFolders of
                            Just { isOpen } ->
                                isOpen

                            otherWise ->
                                True
                    , folderChildren = folderChildren
                    , fileChildren = fileChildren
                    }
    in
        subtree "~"


view : String -> Model file -> Html (Msg file)
view fileSearchInput fileSystem =
    let
        filesToShow =
            fileSystem
                |> FileSystem.getAllFilePaths
                |> List.filter (String.contains fileSearchInput)

        foldersToShow =
            fileSystem
                |> FileSystem.getAllFolderPaths
                |> List.filter
                    (\folderPath -> List.any (String.startsWith folderPath) filesToShow)

        tree =
            treeFromFileSystem
                { fileSystem
                    | allFilesWithHashes =
                        fileSystem.allFilesWithHashes
                            |> Dict.filter
                                (\path _ -> List.member path filesToShow)
                    , allFolders =
                        fileSystem.allFolders
                            |> Dict.filter
                                (\path _ -> List.member path foldersToShow)
                }
    in
        viewTree fileSystem tree


viewTree : Model file -> Tree -> Html (Msg file)
viewTree fileSystem tree =
    case tree of
        Tree { path, isOpen, folderChildren, fileChildren } ->
            div
                [ style
                    (List.append
                        CssHelpers.unselectable
                        [ ( "cursor", "default" ) ]
                    )
                ]
                [ p
                    [ style
                        [ ( "padding", "8px" )
                        , ( "class", "8px" )
                        , ( "margin", "0px" )
                        ]
                    , onMouseDown (FileSystem.OpenCloseFolder path)
                    ]
                    [ div
                        [ style
                            [ ( "margin-right", "6px" )
                            , ( "margin-top", "-2px" )
                            , ( "float", "left" )
                            ]
                        ]
                        [ if isOpen then
                            MIF.folder_open (Color.rgb 159 128 74) 18
                          else
                            MIF.folder (Color.rgb 159 128 74) 18
                        ]
                    , Html.text (takeName path)
                    ]
                , div
                    [ style
                        [ ( "margin-left", "20px" )
                        , ( "display"
                          , if isOpen then
                                "block"
                            else
                                "none"
                          )
                        ]
                    ]
                    (List.append
                        (List.map (viewTree fileSystem) folderChildren)
                        (List.map (viewTree fileSystem) fileChildren)
                    )
                ]

        Leaf { path } ->
            p
                [ style
                    [ ( "margin", "0px" )
                    , ( "padding", "8px" )
                    , ( "background-color"
                      , if fileSystem.maybePathOfTheFocusedFile == Just path then
                            "#2e2e2e"
                        else
                            "#262626"
                      )
                    ]
                , onMouseDown (FileSystem.OpenAndFocusFile path)
                ]
                [ div
                    [ style
                        [ ( "margin-right", "6px" )
                        , ( "margin-top", "2px" )
                        , ( "float", "left" )
                        ]
                    ]
                    [ MIC.content_paste (Color.rgb 107 155 192) 12 ]
                , Html.text (takeName path)
                ]
