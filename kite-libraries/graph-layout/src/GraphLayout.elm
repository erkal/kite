module GraphLayout exposing (..)

import Dict exposing (Dict)
import BasicGeometry exposing (..)


type alias Name =
    String


type alias Radius =
    Float


type Layout
    = Align Direction
    | HorizontallyEquidistant
    | VerticallyEquidistant
    | CircullaryEquidistant


type Direction
    = Bottom
    | Top
    | Left
    | Right
    | Circular


lay : Layout -> Dict Name Point -> Dict Name Point
lay layout d =
    let
        takeXs =
            Dict.values >> List.map Tuple.first

        takeYs =
            Dict.values >> List.map Tuple.second

        setYOfAll y =
            d |> Dict.map (\_ ( x, _ ) -> ( x, y ))

        setXOfAll x =
            d |> Dict.map (\_ ( _, y ) -> ( x, y ))

        maybeMinY =
            takeYs >> List.minimum

        maybeMaxY =
            takeYs >> List.maximum

        maybeMinX =
            takeXs >> List.minimum

        maybeMaxX =
            takeXs >> List.maximum

        count =
            Dict.toList >> List.length

        calculatedCircle =
            if Dict.isEmpty d then
                Nothing
            else
                let
                    maybeCenter =
                        BasicGeometry.gravityCenter (d |> Dict.values)

                    radius =
                        100
                in
                    case maybeCenter of
                        Nothing ->
                            Nothing

                        Just center ->
                            Just (Circle center radius)
    in
        case layout of
            Align Top ->
                Maybe.map setYOfAll (maybeMinY d)
                    |> Maybe.withDefault Dict.empty

            Align Bottom ->
                Maybe.map setYOfAll (maybeMaxY d)
                    |> Maybe.withDefault Dict.empty

            Align Left ->
                Maybe.map setXOfAll (maybeMinX d)
                    |> Maybe.withDefault Dict.empty

            Align Right ->
                Maybe.map setXOfAll (maybeMaxX d)
                    |> Maybe.withDefault Dict.empty

            HorizontallyEquidistant ->
                let
                    min =
                        maybeMinX d |> Maybe.withDefault 0

                    max =
                        maybeMaxX d |> Maybe.withDefault 0

                    delta =
                        (max - min) / (toFloat (count d - 1))

                    applyPos i ( vertexName, pos ) =
                        ( vertexName, ( min + toFloat i * delta, Tuple.second pos ) )
                in
                    d
                        |> Dict.toList
                        |> List.sortBy (Tuple.second >> Tuple.first)
                        |> List.indexedMap applyPos
                        |> Dict.fromList

            VerticallyEquidistant ->
                let
                    min =
                        maybeMinY d |> Maybe.withDefault 0

                    max =
                        maybeMaxY d |> Maybe.withDefault 0

                    delta =
                        (max - min) / (toFloat (count d - 1))

                    applyPos i ( vertexName, pos ) =
                        ( vertexName, ( Tuple.first pos, min + toFloat i * delta ) )
                in
                    d
                        |> Dict.toList
                        |> List.sortBy (Tuple.second >> Tuple.second)
                        |> List.indexedMap applyPos
                        |> Dict.fromList

            Align Circular ->
                case calculatedCircle of
                    Just (Circle center radius) ->
                        let
                            newPosition _ xy =
                                diff xy center
                                    |> normalize
                                    |> scalarMult radius
                                    |> add center
                        in
                            d
                                |> Dict.map newPosition

                    Nothing ->
                        d

            CircullaryEquidistant ->
                case calculatedCircle of
                    Just (Circle center radius) ->
                        let
                            unitAngle =
                                2 * pi / toFloat (count d)

                            correct theta =
                                -- because radian in elm is negative for pi < .. < 2 * pi
                                if theta < 0 then
                                    2 * pi + theta
                                else
                                    theta
                        in
                            d
                                |> Dict.map (\_ pos -> toPolar (diff pos center))
                                |> Dict.toList
                                |> List.sortBy (\( _, ( _, theta ) ) -> correct theta)
                                |> List.indexedMap (\i ( name, ( r, theta ) ) -> ( name, add center (fromPolar ( r, 0.01 + toFloat i * unitAngle )) ))
                                |> Dict.fromList

                    Nothing ->
                        d
