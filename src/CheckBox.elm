module CheckBox exposing (view)

import Char
import Html as H exposing (Html)
import Html.Attributes as HA
import Html.Events as HE


view : Maybe Bool -> Html Bool
view maybeChecked =
    let
        ( t, msg ) =
            case maybeChecked of
                Just True ->
                    ( String.fromChar (Char.fromCode 10004), False )

                Just False ->
                    ( String.fromChar (Char.fromCode 0), True )

                Nothing ->
                    ( "?", True )
    in
    H.div
        [ HA.style "border-radius" "2px"
        , HA.style "background-color" "#454545"
        , HA.style "padding" "2px"
        , HA.style "padding-left" "6px"
        , HA.style "width" "11px"
        , HA.style "height" "15px"
        , HE.onClick msg
        ]
        [ H.text t ]
