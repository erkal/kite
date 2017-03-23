module Widgets.PanZoom exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (on)
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Json.Decode as Decode
import Mouse exposing (Position)
import Keyboard
import PanAndZoom as PZ
import PanAndZoom.Basics as PB exposing (ScaleAndTranslate)


widgetName : String
widgetName =
    "Pan and Zoom"


explanations : String
explanations =
    """
    To Pan, hold shift and drag.
    To Zoom in or out, hold alt and drag vertically.
    """



-- MODEL


type alias Model =
    PZ.Model


initialModel : PZ.Model
initialModel =
    PZ.initialModel
        |> PZ.setScaleLimits { minScale = 0.3, maxScale = 6 }



-- UPDATE


type alias Msg =
    PZ.Msg


type CallToFileSystem
    = PauseRecording
    | ResumeRecording
    | NoCall


update : PZ.Msg -> PZ.Model -> ScaleAndTranslate -> ( PZ.Model, Maybe ScaleAndTranslate, CallToFileSystem )
update msg model scaleAndTranslate =
    let
        ( newModel, maybeScaleAndTranslate ) =
            {- because we deal with more than one graph,
               we have to update our scaleAndTranslate by the current graphs scaleAndTranslate.
            -}
            case msg of
                PZ.ActivatePanning ->
                    PZ.update msg (model |> PZ.setScaleAndTranslate scaleAndTranslate)

                PZ.ActivateZooming ->
                    PZ.update msg (model |> PZ.setScaleAndTranslate scaleAndTranslate)

                otherwise ->
                    PZ.update msg model
    in
        case msg of
            PZ.DragStart _ ->
                ( newModel
                , maybeScaleAndTranslate
                , PauseRecording
                )

            PZ.DragEnd ->
                ( newModel, maybeScaleAndTranslate, ResumeRecording )

            otherwise ->
                ( newModel, maybeScaleAndTranslate, NoCall )



-- SUBSCRIPTIONS


subscriptions : PZ.Model -> Sub PZ.Msg
subscriptions model =
    Sub.batch
        [ Keyboard.downs
            (\keyCode ->
                if keyCode == 16 then
                    -- 16 is the keycode of the shift key
                    PZ.ActivatePanning
                else if keyCode == 18 then
                    -- 18 is the keycode of the alt key
                    PZ.ActivateZooming
                else
                    PZ.NoOp
            )
        , Mouse.moves
            (case model.state of
                PZ.Idle ->
                    (\_ -> PZ.NoOp)

                otherwise ->
                    PZ.DragAt
            )
        , Keyboard.ups (\keyCode -> PZ.GetIdle)
        , Mouse.ups (\_ -> PZ.DragEnd)
        ]



-- VIEW


view : PZ.Model -> { layoutWidth : Int, layoutHeight : Int } -> Html PZ.Msg
view model { layoutWidth, layoutHeight } =
    rect
        [ on "mousedown" (Decode.map PZ.DragStart Mouse.position)
        , Html.Attributes.style
            [ ( "width", toString layoutWidth ++ "px" )
            , ( "height", toString layoutHeight ++ "px" )
            , ( "opacity", "0" )
            , ( "cursor"
              , case model.state of
                    PZ.Idle ->
                        "crosshair"

                    PZ.Zooming _ ->
                        "ns-resize"

                    PZ.Panning Nothing ->
                        "-webkit-grab"

                    PZ.Panning _ ->
                        "-webkit-grabbing"
              )
            ]
        ]
        [ g [ transform (PB.extractTransformForSvg model.scaleAndTranslate) ] []
        ]


viewMenu : Model -> Html PZ.Msg
viewMenu model =
    div []
        [ p [] [ Html.text explanations ] ]
