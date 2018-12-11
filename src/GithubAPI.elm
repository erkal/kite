port module GithubAPI exposing (ElmFileContentAccumulator, Msg(..), RawElmFile, State(..), getPathsOfElmFiles, pathsOfElmFilesDecoder, update)

import Http
import Json.Decode as JD exposing (Decoder, Value)


type State
    = Downloading ElmFileContentAccumulator
    | DownloadFinished (List RawElmFile)
    | DownloadError String


type alias RawElmFile =
    String


type alias ElmFileContentAccumulator =
    { restOfPaths : List String
    , elmFiles : List RawElmFile
    }


type Msg
    = GotPathsOfElmFiles (Result Http.Error (List String))
    | GotElmFile (Result Http.Error RawElmFile)


getPathsOfElmFiles : Cmd Msg
getPathsOfElmFiles =
    Http.get
        { url = "https://api.github.com/repos/erkal/kite/git/trees/master?recursive=1"
        , expect = Http.expectJson GotPathsOfElmFiles pathsOfElmFilesDecoder
        }


pathsOfElmFilesDecoder : Decoder (List String)
pathsOfElmFilesDecoder =
    let
        allFiles =
            JD.field "tree" (JD.list (JD.field "path" JD.string))

        elmFiles =
            JD.map (List.filter (String.endsWith ".elm")) allFiles
    in
    elmFiles


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
                                , expect = Http.expectString GotElmFile
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

        GotElmFile httpResult ->
            case state of
                Downloading { restOfPaths, elmFiles } ->
                    case httpResult of
                        Ok receivedElmFile ->
                            case restOfPaths of
                                p :: ps ->
                                    ( Downloading
                                        (ElmFileContentAccumulator ps
                                            (receivedElmFile :: elmFiles)
                                        )
                                    , Http.get
                                        { url =
                                            "https://raw.githubusercontent.com/erkal/kite/master/" ++ p
                                        , expect = Http.expectString GotElmFile
                                        }
                                    )

                                [] ->
                                    ( DownloadFinished
                                        (receivedElmFile :: elmFiles)
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
