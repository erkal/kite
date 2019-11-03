module Generators.ElmDep exposing (Model, Msg(..), StateVizData(..), finishedDownloadingWith, getPathsOfElmFiles, initialModel, stateVizData, toGraphFile, update)

import Base64
import Char
import Colors
import Dict exposing (Dict)
import Graph exposing (Edge, Node)
import Graph.Layout
import GraphFile as GF exposing (EdgeProperties, GraphFile, VertexId, VertexProperties)
import Http
import Json.Decode as JD exposing (Decoder)
import Parser exposing ((|.), (|=), Parser)
import Set


type alias Model =
    { repoNameInput : String
    , token : String
    , state : State
    }


type State
    = WaitingForUserInput
    | Downloading ElmFileAccumulator
    | DownloadFinished (List ElmFile)
    | Error String


type alias ElmFileAccumulator =
    { downloadedElmFiles : List ElmFile
    , pathToDownload : Path
    , waitingPaths : List Path
    }


type ElmFile
    = ElmFile
        { path : Path
        , maybeModuleName : {- This is a `Maybe`, because not every elm file is a module. -} Maybe Name
        , dependencies : List Name
        , loc : Int
        }


type alias Path =
    String


type alias Raw =
    String


type alias Name =
    String


initialModel : Model
initialModel =
    { repoNameInput = "elm/core"
    , token = ""
    , state = WaitingForUserInput
    }


finishedDownloadingWith : Model -> Maybe (List ElmFile)
finishedDownloadingWith m =
    case m.state of
        DownloadFinished listOfElmFiles ->
            Just listOfElmFiles

        _ ->
            Nothing


fromRawToElmFile : { path : String, raw : Raw } -> ElmFile
fromRawToElmFile { path, raw } =
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

        modulePrefixParser =
            Parser.oneOf
                [ Parser.succeed identity
                    |. Parser.keyword "module"
                , Parser.succeed identity
                    |. Parser.keyword "port"
                    |. Parser.spaces
                    |. Parser.keyword "module"
                , Parser.succeed identity
                    |. Parser.keyword "effect"
                    |. Parser.spaces
                    |. Parser.keyword "module"
                ]
                |. Parser.spaces
    in
    ElmFile
        { path = path
        , maybeModuleName =
            let
                moduleNameParseResult =
                    Parser.run (modulePrefixParser |= moduleNameParser)
            in
            lines
                |> List.filterMap (moduleNameParseResult >> Result.toMaybe)
                |> List.head
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


getPathsOfElmFiles : Model -> String -> Cmd Msg
getPathsOfElmFiles m token =
    Http.get
        { url =
            "https://api.github.com/repos/"
                ++ m.repoNameInput
                ++ "/git/trees/master?recursive=1"
                ++ (if String.length token > 0 then
                        "&access_token=" ++ token

                    else
                        ""
                   )
        , expect = Http.expectJson GotPathsOfElmFiles pathsOfElmFilesDecoder
        }


pathsOfElmFilesDecoder : Decoder (List String)
pathsOfElmFilesDecoder =
    JD.field "tree" (JD.list (JD.field "path" JD.string))
        |> JD.map (List.filter (String.endsWith ".elm"))


type Msg
    = GotPathsOfElmFiles (Result Http.Error (List String))
    | GotRawElmFile (Result Http.Error String)
    | ChangeRepo String
    | ChangeToken String


getGitHubFile : String -> String -> String -> String -> Cmd Msg
getGitHubFile owner repo token filePath =
    Http.request
        { method = "GET"
        , headers =
            if String.length token > 0 then
                [ Http.header "Authorization" ("Token " ++ token) ]

            else
                []
        , url =
            String.join "/"
                [ "https://api.github.com/repos"
                , owner
                , repo
                , "contents"
                , filePath
                ]
        , body = Http.emptyBody
        , expect =
            Http.expectJson
                (\result ->
                    result
                        |> Result.map
                            (\str ->
                                str
                                    |> String.filter (\c -> c /= '\n')
                                    |> Base64.decode
                                    |> Result.withDefault ""
                            )
                        |> GotRawElmFile
                )
                (JD.field "content" JD.string)
        , timeout = Nothing
        , tracker = Nothing
        }


splitOwnerRepo : Model -> (String -> String -> ( Model, Cmd Msg )) -> ( Model, Cmd Msg )
splitOwnerRepo model success =
    case String.split "/" model.repoNameInput of
        [ owner, repo ] ->
            success owner repo

        _ ->
            ( { model
                | state = Error "Malformed GitHub URL"
              }
            , Cmd.none
            )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    case msg of
        ChangeRepo str ->
            ( { m | repoNameInput = str, state = WaitingForUserInput }
            , Cmd.none
            )

        ChangeToken str ->
            ( { m
                | token = str
                , state = WaitingForUserInput
              }
            , Cmd.none
            )

        GotPathsOfElmFiles httpResult ->
            case m.state of
                Downloading _ ->
                    ( m, Cmd.none )

                _ ->
                    case httpResult of
                        Ok (p :: ps) ->
                            splitOwnerRepo m
                                (\owner repo ->
                                    ( { m
                                        | state =
                                            Downloading
                                                { downloadedElmFiles = []
                                                , pathToDownload = p
                                                , waitingPaths = ps
                                                }
                                      }
                                    , getGitHubFile owner
                                        repo
                                        m.token
                                        p
                                    )
                                )

                        Ok [] ->
                            ( { m
                                | state = Error "No Elm Files have been found."
                              }
                            , Cmd.none
                            )

                        _ ->
                            ( { m
                                | state = Error "Couldn't connect to github."
                              }
                            , Cmd.none
                            )

        GotRawElmFile httpResult ->
            case m.state of
                Downloading old ->
                    case httpResult of
                        Ok raw ->
                            let
                                newlyDownloadedFile =
                                    fromRawToElmFile
                                        { path = old.pathToDownload
                                        , raw = raw
                                        }

                                newDownloadedElmFiles =
                                    newlyDownloadedFile
                                        :: old.downloadedElmFiles
                            in
                            case old.waitingPaths of
                                p :: ps ->
                                    splitOwnerRepo m
                                        (\owner repo ->
                                            ( { m
                                                | state =
                                                    Downloading
                                                        { downloadedElmFiles = newDownloadedElmFiles
                                                        , pathToDownload = p
                                                        , waitingPaths = ps
                                                        }
                                              }
                                            , getGitHubFile owner
                                                repo
                                                m.token
                                                p
                                            )
                                        )

                                [] ->
                                    ( { m
                                        | state =
                                            DownloadFinished newDownloadedElmFiles
                                      }
                                    , Cmd.none
                                    )

                        _ ->
                            ( { m | state = Error "" }
                            , Cmd.none
                            )

                _ ->
                    ( m
                    , Cmd.none
                    )


toGraphFile : List ElmFile -> GraphFile
toGraphFile listOfElmFiles =
    let
        dVP =
            GF.kitesDefaultVertexProp

        dEP =
            GF.kitesDefaultEdgeProp

        idDict : Dict String VertexId
        idDict =
            listOfElmFiles
                |> List.indexedMap
                    (\i elmFile ->
                        ( moduleNameOrPath elmFile
                        , i + 1
                        )
                    )
                |> Dict.fromList

        safeGetId : String -> VertexId
        safeGetId n =
            idDict |> Dict.get n |> Maybe.withDefault 0

        handleElmFile :
            ElmFile
            -> ( Node VertexProperties, List (Edge EdgeProperties) )
        handleElmFile ((ElmFile { loc, dependencies }) as elmFile) =
            ( Node (safeGetId (moduleNameOrPath elmFile))
                { dVP
                    | label = moduleNameOrPath elmFile
                    , radius = 0.5 * sqrt (toFloat loc)
                    , color = Colors.blue
                }
            , dependencies
                |> List.filterMap
                    (\importedModule ->
                        Dict.get importedModule idDict
                            |> Maybe.map
                                (\j ->
                                    Edge
                                        (safeGetId (moduleNameOrPath elmFile))
                                        j
                                        { dEP | color = Colors.purple }
                                )
                    )
            )

        nodesWithOutgoingNeighbours : List ( Node VertexProperties, List (Edge EdgeProperties) )
        nodesWithOutgoingNeighbours =
            List.map handleElmFile listOfElmFiles

        nodes =
            nodesWithOutgoingNeighbours |> List.map Tuple.first

        edges =
            nodesWithOutgoingNeighbours
                |> List.map Tuple.second
                |> List.concat

        graph =
            Graph.fromNodesAndEdges nodes edges
                |> Graph.Layout.circular
                    { center = ( 300, 300 ), radius = 250 }
    in
    GF.default
        |> GF.setGraph graph
        |> GF.topologicalSort


type StateVizData
    = WaitingForUserInputViz
    | DownloadingViz
        { numberOfModules : Int
        , namesOfDownloadedModules : List String
        }
    | DownloadFinishedViz { namesOfDownloadedModules : List String }
    | ErrorViz String


moduleNameOrPath : ElmFile -> String
moduleNameOrPath (ElmFile { maybeModuleName, path }) =
    case maybeModuleName of
        Just moduleName ->
            moduleName

        Nothing ->
            path


stateVizData : Model -> StateVizData
stateVizData m =
    case m.state of
        WaitingForUserInput ->
            WaitingForUserInputViz

        Downloading { waitingPaths, downloadedElmFiles } ->
            DownloadingViz
                { numberOfModules =
                    1 + List.length waitingPaths + List.length downloadedElmFiles
                , namesOfDownloadedModules =
                    List.reverse (List.map moduleNameOrPath downloadedElmFiles)
                }

        DownloadFinished listOfElmFiles ->
            DownloadFinishedViz
                { namesOfDownloadedModules =
                    List.reverse (List.map moduleNameOrPath listOfElmFiles)
                }

        Error str ->
            ErrorViz str
