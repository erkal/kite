module ColorPicker exposing (view)

import Colors exposing (Color)
import Html as H exposing (Html)
import Html.Attributes as HA
import Html.Events as HE



-- For the hover effect we have to use css file. See style-color-picker.css


colors : List Color
colors =
    Colors.vertexAndEdgeColors 


view : Maybe Color -> Html Color
view maybeSelectedColor =
    let
        dropbtn =
            case maybeSelectedColor of
                Just color ->
                    H.button [ HA.class "dropbtn" ]
                        [ H.div
                            [ HA.style "background-color" color
                            , HA.style "width" "100%"
                            , HA.style "height" "100%"
                            ]
                            []
                        ]

                Nothing ->
                    H.button [ HA.class "dropbtn" ]
                        [ H.div
                            [ HA.style "background-color" "#454545"
                            , HA.style "width" "100%"
                            , HA.style "height" "100%"
                            , HA.style "color" "white"
                            ]
                            [ H.text "?" ]
                        ]

        colorBox color2 =
            H.a
                [ HA.style "background-color" color2
                , HE.onClick color2
                ]
                []
    in
    H.div [ HA.class "dropdown" ]
        [ dropbtn
        , H.div [ HA.class "dropdown-content" ]
            (List.map colorBox colors)
        ]
