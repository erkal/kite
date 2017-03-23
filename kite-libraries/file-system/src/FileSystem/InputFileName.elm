port module FileSystem.InputFileName exposing (..)

import FileSystem exposing (..)
import Html exposing (Html, input, p)
import Html.Attributes exposing (placeholder, style, type_, value)
import Html.Events exposing (onInput)


view : Model a -> Html (Msg a)
view model =
    let
        viewInputArea =
            input
                [ type_ "text"
                , style [ ( "margin-left", "10px" ) ]
                , placeholder "~/myFolder/myGraph"
                , onInput FileSystem.UpdateUserInputForNewFileName
                , value (getUserInputForNewFile model)
                ]
                []
    in
        p
            [ style [ ( "color", "#6a98bd" ) ] ]
            [ Html.text
                ("Enter path"
                    ++ (case model.state of
                            WaitingForFileNameInputForNewFile ->
                                " for the new file:"

                            WaitingForFileNameInputForSaveAs path ->
                                " for the new copy of " ++ path ++ ": "

                            Idle ->
                                "THERE IS A PROBLEM HERE IF THIS IS DISPLAYED!"
                       )
                )
            , viewInputArea
            ]
