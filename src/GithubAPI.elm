port module GithubAPI exposing (GithubContents, githubContentsDecoder, gotContentsFromGithub, todo)

import Http
import Json.Decode as JD exposing (Decoder, Value)


todo =
    Http.get
        { url = "https://api.github.com/repos/erkal/kite/git/trees/master?recursive=1"
        , expect = Http.expectJson gotContentsFromGithub githubContentsDecoder
        }


type alias GithubContents =
    List String


githubContentsDecoder : Decoder GithubContents
githubContentsDecoder =
    let
        listOfAllPaths =
            JD.field "tree" (JD.list (JD.field "path" JD.string))
    in
    listOfAllPaths


gotContentsFromGithub httpResult =
    case httpResult of
        Ok str ->
            let
                a =
                    str |> Debug.log ""
            in
            42

        _ ->
            42
