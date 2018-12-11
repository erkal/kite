port module Generators.ElmDep exposing (Msg(..), State(..), getPathsOfElmFiles, toGraphFile, update)

import Char
import Colors
import Dict exposing (Dict)
import Graph exposing (Edge, Node)
import GraphFile as GF exposing (EdgeProperties, GraphFile, MyGraph, VertexId, VertexProperties)
import Http
import Json.Decode as JD exposing (Decoder, Value)
import Parser exposing ((|.), (|=), Parser)
import Set exposing (Set)


type State
    = Downloading ElmFileContentAccumulator
    | DownloadFinished (List ElmFile)
    | DownloadError String


type alias ElmFileContentAccumulator =
    { pathsToDownload : List String
    , downloaded : List ElmFile
    }


type ElmFile
    = ElmFile
        { moduleName : String
        , dependencies : List String
        , loc : Int
        }


type Msg
    = GotPathsOfElmFiles (Result Http.Error (List String))
    | GotRawElmFile (Result Http.Error String)


fromRawtoElmFile : String -> ElmFile
fromRawtoElmFile raw =
    let
        lines =
            String.lines raw

        moduleNameParser : Parser String
        moduleNameParser =
            Parser.variable
                { start = Char.isUpper
                , inner = \c -> Char.isAlphaNum c || c == '_' || c == '.'
                , reserved = Set.empty
                }
    in
    ElmFile
        { moduleName =
            lines
                |> List.head
                |> Maybe.map
                    (Parser.run
                        (Parser.oneOf
                            [ Parser.succeed identity
                                |. Parser.keyword "module"
                            , Parser.succeed identity
                                |. Parser.keyword "port"
                                |. Parser.spaces
                                |. Parser.keyword "module"
                            ]
                            |. Parser.spaces
                            |= moduleNameParser
                        )
                        >> Result.withDefault "ERROR"
                    )
                |> Maybe.withDefault "ERROR"
        , dependencies =
            lines
                |> List.filterMap
                    (Parser.run
                        (Parser.succeed identity
                            |. Parser.keyword "import"
                            |. Parser.spaces
                            |= moduleNameParser
                        )
                        >> Result.toMaybe
                    )
        , loc = List.length lines
        }


getPathsOfElmFiles : Cmd Msg
getPathsOfElmFiles =
    Http.get
        { url = "https://api.github.com/repos/erkal/kite/git/trees/master?recursive=1"
        , expect = Http.expectJson GotPathsOfElmFiles pathsOfElmFilesDecoder
        }


getRawElmFile : String -> Cmd Msg
getRawElmFile path =
    Http.get
        { url = "https://raw.githubusercontent.com/erkal/kite/master/" ++ path
        , expect = Http.expectString GotRawElmFile
        }


pathsOfElmFilesDecoder : Decoder (List String)
pathsOfElmFilesDecoder =
    JD.field "tree" (JD.list (JD.field "path" JD.string))
        |> JD.map (List.filter (String.endsWith ".elm"))


update : Msg -> State -> ( State, Cmd Msg )
update msg state =
    case msg of
        GotPathsOfElmFiles httpResult ->
            case state of
                Downloading _ ->
                    ( state, Cmd.none )

                _ ->
                    case httpResult of
                        Ok (p :: ps) ->
                            ( Downloading (ElmFileContentAccumulator ps [])
                            , Http.get
                                { url =
                                    "https://raw.githubusercontent.com/erkal/kite/master/" ++ p
                                , expect = Http.expectString GotRawElmFile
                                }
                            )

                        Ok [] ->
                            ( DownloadError "No Elm Files have been found."
                            , Cmd.none
                            )

                        _ ->
                            ( DownloadError "Couldn't connect to github."
                            , Cmd.none
                            )

        GotRawElmFile httpResult ->
            case state of
                Downloading { pathsToDownload, downloaded } ->
                    case httpResult of
                        Ok raw ->
                            case pathsToDownload of
                                p :: ps ->
                                    ( Downloading
                                        (ElmFileContentAccumulator ps
                                            (fromRawtoElmFile raw :: downloaded)
                                        )
                                    , getRawElmFile p
                                    )

                                [] ->
                                    ( DownloadFinished
                                        (fromRawtoElmFile raw :: downloaded)
                                    , Cmd.none
                                    )

                        _ ->
                            ( DownloadError ""
                            , Cmd.none
                            )

                _ ->
                    ( state
                    , Cmd.none
                    )


toGraphFile : List ElmFile -> GraphFile
toGraphFile l =
    let
        dVP =
            GF.defaultVertexProp

        dEP =
            GF.defaultEdgeProp

        idDict : Dict String VertexId
        idDict =
            l
                |> List.indexedMap
                    (\i (ElmFile { moduleName }) -> ( moduleName, i + 1 ))
                |> Dict.fromList

        safeGetId : String -> VertexId
        safeGetId moduleName =
            idDict |> Dict.get moduleName |> Maybe.withDefault 0

        handleElmFile (ElmFile { moduleName, dependencies, loc }) =
            ( Node (safeGetId moduleName)
                { dVP
                    | label = Just moduleName
                    , labelAbove = True
                    , radius = 0.5 * sqrt (toFloat loc)
                    , fixed = moduleName == "Main"
                }
            , dependencies
                |> List.filterMap
                    (\importedModule ->
                        case Dict.get importedModule idDict of
                            Just j ->
                                Just (Edge (safeGetId moduleName) j dEP)

                            Nothing ->
                                Nothing
                    )
            )

        nodesWithOutgoingNeighbours : List ( Node VertexProperties, List (Edge EdgeProperties) )
        nodesWithOutgoingNeighbours =
            List.map handleElmFile l

        nodes =
            nodesWithOutgoingNeighbours |> List.map Tuple.first

        edges =
            nodesWithOutgoingNeighbours |> List.map Tuple.second |> List.concat

        graph =
            Graph.fromNodesAndEdges nodes edges
    in
    GF.setGraph graph GF.default
