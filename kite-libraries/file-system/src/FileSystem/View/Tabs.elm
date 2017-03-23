port module FileSystem.View.Tabs exposing (view)

import Color
import Html exposing (Html, div, p, span, text, button)
import Html.Attributes exposing (style)
import Html.Events exposing (onMouseDown, onWithOptions)
import Json.Decode
import Material.Icons.Content
import FileSystem exposing (..)


view : Model file -> Html (Msg msg)
view model =
    div
        [ style
            [ ( "background-color", "#1e1e1e" )
            , ( "overflow-x", "auto" )
            , ( "overflow-y", "hidden" )
            , ( "white-space", "nowrap" )
            ]
        ]
        (model.openedFilesOrderedForTabs |> List.map (viewTab model))


viewTab : Model file -> Path -> Html (Msg msg)
viewTab model path =
    div
        [ style
            [ ( "display", "inline-block" )
            , ( "height", "64px" )
            , ( "cursor", "default" )
            , ( "border-style", "solid" )
            , ( "border-width", "0px 0px 1px 0px" )
            , ( "border-color"
              , if FileSystem.hasChanged path model then
                    "#cf7619"
                else
                    "#2e2e2e"
              )
            , ( "background-color"
              , case model.maybePathOfTheFocusedFile of
                    Nothing ->
                        Debug.crash ""

                    Just pathOfTheFocusedFile ->
                        if pathOfTheFocusedFile == path then
                            "#2e2e2e"
                        else
                            "#1e1e1e"
              )
            ]
        , onMouseDown (FileSystem.FocusFile path)
        ]
        [ p
            [ style
                [ ( "color"
                  , case model.maybePathOfTheFocusedFile of
                        Just pathOfTheFocusedFile ->
                            if pathOfTheFocusedFile == path then
                                "white"
                            else
                                "gray"

                        otherwise ->
                            "red"
                  )
                , ( "margin", "25px" )
                ]
            ]
            [ Html.text (takeName path)
            , span
                [ style
                    [ ( "position", "relative" )
                    , ( "margin-left", "16px" )
                    , ( "top", "3px" )
                    ]
                , onWithOptions "mousedown"
                    { stopPropagation = True, preventDefault = False }
                    (Json.Decode.succeed (FileSystem.CloseFile path))
                ]
                [ Material.Icons.Content.clear Color.gray 12 ]
            ]
        ]
