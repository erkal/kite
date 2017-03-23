module SvgHelpers exposing (..)

import Html exposing (Html)
import Svg
import Svg.Attributes exposing (d, transform, fill)
import BasicGeometry exposing (..)


pathdFromPoints : List Point -> String
pathdFromPoints points =
    let
        p =
            points
                |> List.map (\( x, y ) -> toString x ++ " " ++ toString y)
                |> List.intersperse " L "
                |> String.concat
    in
        "M" ++ p ++ "Z"


quadraticBezier : Point -> Point -> Point -> String
quadraticBezier start control end =
    let
        convert position =
            toString (Tuple.first position) ++ "," ++ toString (Tuple.second position)
    in
        "M"
            ++ convert start
            ++ " Q"
            ++ convert control
            ++ " "
            ++ convert end


{-| controlFactor 1 corresponds to right triangle.
-}
quadraticBezierSymmetric : Point -> Float -> Point -> String
quadraticBezierSymmetric start controlFactor end =
    let
        vecFromStartToMid =
            diff end start
                |> scalarMult 0.5

        vecFromMidToControl =
            vecFromStartToMid
                |> rotateBy 90
                |> scalarMult controlFactor

        control =
            add (add start vecFromStartToMid) vecFromMidToControl
    in
        quadraticBezier start control end


{-| make arrow head
-}
makeArrowHead : { sourcePos : Point, targetPos : Point, targetRadius : Float, color : String } -> Html a
makeArrowHead { sourcePos, targetPos, targetRadius, color } =
    let
        ( ( sx, sy ), ( tx, ty ) ) =
            ( sourcePos, targetPos )

        ( dx, dy ) =
            ( tx - sx, ty - sy )

        dist =
            sqrt (dx * dx + dy * dy)

        rdd =
            (targetRadius / (max dist 0.00001))

        {- Why max? Because otherwise, if source and target are the same, it causes runtime errors. -}
        ( trx, try ) =
            ( tx - rdd * dx, ty - rdd * dy )

        angleAsRadiant =
            atan2 dy dx

        angleAsDegree =
            360 * angleAsRadiant / (2 * pi)

        translate =
            "translate(" ++ toString trx ++ "," ++ toString try ++ ")"

        rotate =
            "rotate(" ++ toString angleAsDegree ++ ")"
    in
        Svg.path
            [ d "M0 0 L-10 -4 L-10 4 Z"
            , transform (translate ++ rotate)
            , fill color
            ]
            []
