module Colision exposing
    ( Circle
    , LineSegment
    , Point
    , Rect
    , collideLineSegments
    , collideRectWithCircle
    )


type alias Rect =
    { x : Float
    , y : Float
    , width : Float
    , height : Float
    }


type alias Circle =
    { x : Float
    , y : Float
    , radius : Float
    }


{-| See the webpage <https://yal.cc/rectangle-circle-intersection-test/>
There is also a nice visualization of this.
-}
collideRectWithCircle : Rect -> Circle -> Bool
collideRectWithCircle rect circle =
    let
        ( deltaX, deltaY ) =
            ( circle.x - max rect.x (min circle.x (rect.x + rect.width))
            , circle.y - max rect.y (min circle.y (rect.y + rect.height))
            )
    in
    deltaX * deltaX + deltaY * deltaY < circle.radius * circle.radius



--


type alias Point =
    ( Float, Float )


type alias LineSegment =
    ( Point, Point )


{-| See the webpage <https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/>
-}
ccw : Point -> Point -> Point -> Bool
ccw ( px, py ) ( qx, qy ) ( rx, ry ) =
    0 > (qy - py) * (rx - qx) - (qx - px) * (ry - qy)


collideLineSegments : LineSegment -> LineSegment -> Bool
collideLineSegments ( p1, q1 ) ( p2, q2 ) =
    (ccw p1 q1 p2 /= ccw p1 q1 q2)
        && (ccw p2 q2 p1 /= ccw p2 q2 q1)
