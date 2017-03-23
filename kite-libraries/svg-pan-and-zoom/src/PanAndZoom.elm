module PanAndZoom exposing (..)

import PanAndZoom.Basics as PB exposing (ScaleAndTranslate)


{-
   This will be updated in time via user interaction.
   scaleLimits are as in https://bl.ocks.org/mbostock/3680999
-}
-- MODEL


type alias Model =
    { scaleAndTranslate : ScaleAndTranslate
    , minScale : Float
    , maxScale : Float
    , zoomSensitivity : Float
    , state : State
    , maybeDrag : Maybe Drag
    }


type State
    = Idle
    | Panning (Maybe { translateAtStart : Point })
    | Zooming
        (Maybe
            { center : Point
            , translateAtStart : Point
            , scaleAtStart : Float
            }
        )


type alias Point =
    ( Float, Float )


type alias Position =
    { x : Int, y : Int }


type alias Drag =
    { start : Position
    , current : Position
    }


initialModel : Model
initialModel =
    { scaleAndTranslate = PB.default
    , minScale = 0.4
    , maxScale = 8
    , zoomSensitivity = 0.02
    , state = Idle
    , maybeDrag = Nothing
    }


setScaleLimits : { minScale : Float, maxScale : Float } -> Model -> Model
setScaleLimits { minScale, maxScale } model =
    { model
        | minScale = minScale
        , maxScale = maxScale
    }


setScaleAndTranslate : ScaleAndTranslate -> Model -> Model
setScaleAndTranslate scaleAndTranslate model =
    { model | scaleAndTranslate = scaleAndTranslate }


setZoomSensitivity : Float -> Model -> Model
setZoomSensitivity k model =
    { model
        | zoomSensitivity = k
    }



-- UPDATE


type Msg
    = NoOp
    | ActivatePanning
    | ActivateZooming
    | DragStart Position
    | DragAt Position
    | DragEnd
    | GetIdle


getDelta : Drag -> Point
getDelta drag =
    ( toFloat (drag.current.x - drag.start.x)
    , toFloat (drag.current.y - drag.start.y)
    )


update : Msg -> Model -> ( Model, Maybe ScaleAndTranslate )
update msg model =
    let
        newModel =
            updateHelper msg model
    in
        case msg of
            DragAt _ ->
                ( newModel, Just newModel.scaleAndTranslate )

            otherwise ->
                ( newModel, Nothing )


updateHelper : Msg -> Model -> Model
updateHelper msg model =
    case msg of
        NoOp ->
            model

        ActivatePanning ->
            { model | state = Panning Nothing }

        ActivateZooming ->
            { model | state = Zooming Nothing }

        DragStart pos ->
            { model
                | maybeDrag = Just (Drag pos pos)
                , state =
                    case model.state of
                        Panning _ ->
                            Panning (Just { translateAtStart = PB.getTranslate model.scaleAndTranslate })

                        Zooming _ ->
                            Zooming
                                (Just
                                    { translateAtStart = PB.getTranslate model.scaleAndTranslate
                                    , scaleAtStart = PB.getScale model.scaleAndTranslate
                                    , center = ( toFloat pos.x, toFloat pos.y )
                                    }
                                )

                        Idle ->
                            Idle
            }

        DragAt pos ->
            let
                newMaybeDrag =
                    model.maybeDrag
                        |> Maybe.map (\drag -> Drag drag.start pos)
            in
                { model
                    | maybeDrag = newMaybeDrag
                    , scaleAndTranslate =
                        model.scaleAndTranslate
                            |> (case model.state of
                                    Panning (Just { translateAtStart }) ->
                                        case newMaybeDrag |> Maybe.map getDelta of
                                            Nothing ->
                                                identity

                                            Just delta ->
                                                PB.pan
                                                    { translateAtStart = translateAtStart
                                                    , delta = delta
                                                    }

                                    Zooming (Just { center, translateAtStart, scaleAtStart }) ->
                                        case newMaybeDrag |> Maybe.map getDelta of
                                            Nothing ->
                                                identity

                                            Just delta ->
                                                PB.zoom
                                                    { translateAtStart = translateAtStart
                                                    , scaleAtStart = scaleAtStart
                                                    , center = center
                                                    , minScale = model.minScale
                                                    , maxScale = model.maxScale
                                                    , delta = model.zoomSensitivity * -(Tuple.second delta)
                                                    }

                                    otherwise ->
                                        identity
                               )
                }

        DragEnd ->
            { model | maybeDrag = Nothing }

        GetIdle ->
            { model | state = Idle }
