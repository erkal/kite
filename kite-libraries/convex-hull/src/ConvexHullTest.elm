module ConvexHullTest exposing (..)

import Html exposing (Html)
import ConvexHull exposing (Point, convexHull)


main : Html a
main =
    Html.text (toString (convexHull test3))


test1 : List Point
test1 =
    [ ( 0, 0 ), ( 14, 14 ), ( 25, 25 ) ]


test2 : List Point
test2 =
    [ ( 0, 0 ), ( 0, 100 ), ( 100, 0 ), ( 100, 100 ) ]


test3 : List Point
test3 =
    [ ( 0, 0 ), ( 20, 30 ), ( 40, 40 ), ( 70, 10 ), ( 0, 100 ), ( 100, 0 ), ( 100, 100 ) ]


test4 : List Point
test4 =
    [ ( 10, 10 ) ]


test5 : List Point
test5 =
    [ ( 10, 10 ), ( 14, 12 ) ]
