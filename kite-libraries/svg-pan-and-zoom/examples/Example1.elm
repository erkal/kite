module Example1 exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (on)
import Svg exposing (..)
import Svg.Attributes exposing (..)
import Mouse exposing (Position)
import Json.Decode as Decode
import PanAndZoom as PZ
import PanAndZoom.Basics as PB
import Keyboard
import Mouse


main : Program Never PZ.Model PZ.Msg
main =
    Html.program
        { init =
            ( PZ.initialModel
                |> PZ.setScaleLimits { minScale = 0.3, maxScale = 6 }
                |> PZ.setZoomSensitivity 0.03
            , Cmd.none
            )
        , view = view
        , update = (\msg model -> ( PZ.updateHelper msg model, Cmd.none ))
        , subscriptions = subscriptions
        }



-- SUBSCRIPTIONS


subscriptions : PZ.Model -> Sub PZ.Msg
subscriptions model =
    Sub.batch
        [ Keyboard.downs
            (\keyCode ->
                if keyCode == 16 then
                    -- shift
                    PZ.ActivatePanning
                else if keyCode == 18 then
                    --alt
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


colors : { circle : Int -> String, explRect : String, backGround : String }
colors =
    { backGround = "white"
    , explRect = "lightgray"
    , circle =
        (\i ->
            if i % 3 == 0 then
                "#47b8e0"
            else if i % 3 == 1 then
                "#ffc952"
            else
                "#ff7473"
        )
    }


numberOfRows : Int
numberOfRows =
    20


numberOfColumns : Int
numberOfColumns =
    40


svgWidth : Int
svgWidth =
    24 * (numberOfColumns + 1)


svgHeight : Int
svgHeight =
    24 * (numberOfRows + 1)


view : PZ.Model -> Html PZ.Msg
view model =
    div
        [ Html.Attributes.style
            [ ( "font-family", """ "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue" """ )
            , ( "font-size", "14px" )
            ]
        ]
        [ Svg.svg
            [ on "mousedown" (Decode.map PZ.DragStart Mouse.position)
            , Html.Attributes.style
                [ ( "background-color", colors.backGround )
                , ( "width", toString svgWidth ++ "px" )
                , ( "height", toString svgHeight ++ "px" )
                , ( "border-width", "1px" )
                , ( "border-style", "solid" )
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
            [ g [ transform (PB.extractTransformForSvg model.scaleAndTranslate) ] allCircles
            , viewScale model
            , viewTranslate model
            , explanations model
            ]
        ]


explanations : PZ.Model -> Html PZ.Msg
explanations model =
    let
        ( x, y ) =
            PB.getTranslate model.scaleAndTranslate

        showLines =
            List.indexedMap
                (\i line ->
                    Svg.text_
                        [ Svg.Attributes.style unselectable
                        , Svg.Attributes.x "20"
                        , Svg.Attributes.y (toString (i * 30 + 30))
                        ]
                        [ Svg.text line ]
                )
    in
        g [] <|
            rect
                [ Svg.Attributes.width "310"
                , Svg.Attributes.height "80"
                , fill colors.explRect
                , opacity "0.9"
                ]
                []
                :: showLines
                    [ "For panning press shift and drag."
                    , "For zooming press alt and drag vertically."
                    ]


unselectable : String
unselectable =
    "cursor: default; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;"


viewTranslate : PZ.Model -> Html PZ.Msg
viewTranslate model =
    case ( model.state, model.maybeDrag ) of
        ( PZ.Panning _, Just { current } ) ->
            g []
                [ Svg.text_
                    [ x (toString (current.x + 10))
                    , y (toString (current.y + 5))
                    , Svg.Attributes.style unselectable
                    ]
                    [ Svg.text
                        ("translate: "
                            ++ toString
                                (PB.getTranslate model.scaleAndTranslate
                                    |> (\( x, y ) -> ( round x, round y ))
                                )
                        )
                    ]
                ]

        otherwise ->
            g [] []


viewScale : PZ.Model -> Html PZ.Msg
viewScale model =
    case model.state of
        PZ.Zooming (Just { center }) ->
            let
                ( x_, y_ ) =
                    center
            in
                g []
                    [ circle
                        [ r "2"
                        , cx (toString x_)
                        , cy (toString y_)
                        ]
                        []
                    , Svg.text_
                        [ x (toString (x_ + 10))
                        , y (toString (y_ + 5))
                        , Svg.Attributes.style unselectable
                        ]
                        [ Svg.text ("scale: " ++ String.left 4 (toString (PB.getScale model.scaleAndTranslate))) ]
                    ]

        otherwise ->
            g [] []


allCircles : List (Html PZ.Msg)
allCircles =
    let
        makeCircle index =
            circle
                [ r "10"
                , fill (colors.circle index)
                , cx (toString (index * 24))
                ]
                []

        lineOfCircles : List (Html PZ.Msg)
        lineOfCircles =
            List.range 1 numberOfColumns
                |> List.map makeCircle

        makeLine translateY =
            g
                [ transform ("translate(0," ++ toString translateY ++ ")") ]
                lineOfCircles
    in
        List.range 1 numberOfRows
            |> List.map ((*) 24 >> makeLine)
