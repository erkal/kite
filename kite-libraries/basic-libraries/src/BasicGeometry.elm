module BasicGeometry exposing (..)


type alias Point =
    ( Float, Float )


type alias Vec =
    Point


type alias Radius =
    Float


type Circle
    = Circle Point Radius


type Line
    = Line Point Vec


type alias Degree =
    Float


type alias Matrix2D =
    ( ( Float, Float ), ( Float, Float ) )


type Rect
    = Rect { position : Point, width : Float, height : Float }


type alias Position =
    { x : Int
    , y : Int
    }


toPoint : { x : Int, y : Int } -> Point
toPoint { x, y } =
    ( toFloat x, toFloat y )


rotationMatrix : Degree -> Matrix2D
rotationMatrix alpha =
    let
        sina =
            sin alpha

        cosa =
            cos alpha
    in
        ( ( cosa, -sina )
        , ( sina, cosa )
        )


dotProd : Vec -> Vec -> Float
dotProd ( u, v ) ( x, y ) =
    u * x + v * y


diff : Vec -> Vec -> Vec
diff ( u, v ) ( x, y ) =
    ( u - x, v - y )


add : Vec -> Vec -> Vec
add ( u, v ) ( x, y ) =
    ( u + x, v + y )


length : Vec -> Float
length ( x, y ) =
    sqrt (x ^ 2 + y ^ 2)


normalize : Vec -> Vec
normalize vec =
    scalarMult (1 / length vec) vec


mult : Matrix2D -> Vec -> Vec
mult ( row1, row2 ) vec =
    ( dotProd row1 vec
    , dotProd row2 vec
    )


scalarMult : Float -> Vec -> Vec
scalarMult k ( x, y ) =
    ( k * x, k * y )


rotateBy : Degree -> Vec -> Vec
rotateBy =
    degrees >> rotationMatrix >> mult


middlePoint : Vec -> Vec -> Vec
middlePoint v w =
    scalarMult 0.5 (add v w)


middleOrthogonal : Point -> Point -> Maybe Line
middleOrthogonal p q =
    if p == q then
        Nothing
    else
        Just (Line (middlePoint p q) (rotateBy 90 (diff p q)))


intersect : Line -> Line -> Maybe Point
intersect (Line (( px, py ) as p) (( vx, vy ) as v)) (Line ( qx, qy ) ( wx, wy )) =
    let
        nominatorOfA =
            wx * (py - qy) + wy * (qx - px)

        denominatorOfA =
            vx * wy - vy * wx
    in
        if denominatorOfA == 0 then
            Nothing
        else
            Just (add p (scalarMult (nominatorOfA / denominatorOfA) v))


{-| Finds the (unique) circle going through the given three points
-}
findCircle : Point -> Point -> Point -> Maybe Circle
findCircle p q r =
    let
        maybeCenter : Maybe Point
        maybeCenter =
            Maybe.map2 intersect
                (middleOrthogonal p q)
                (middleOrthogonal q r)
                |> Maybe.withDefault Nothing
    in
        case maybeCenter of
            Nothing ->
                Nothing

            Just center ->
                let
                    radius =
                        length (diff p center)
                in
                    Just (Circle center radius)


{-| Finds the (unique) rectangle which has the given two points as opposing corners
-}
findRect : Point -> Point -> Rect
findRect ( px, py ) ( qx, qy ) =
    Rect
        { position = ( min px qx, min py qy )
        , width = abs (px - qx)
        , height = abs (py - qy)
        }


inRect : Rect -> Point -> Bool
inRect (Rect { position, width, height }) ( px, py ) =
    let
        ( x, y ) =
            position
    in
        [ px > x && px < x + width
        , py > y && py < y + height
        ]
            |> List.all identity


{-| `gravityCenter l` is the gravity center of the points in l
-}
gravityCenter : List Point -> Maybe Point
gravityCenter l =
    if List.isEmpty l then
        Nothing
    else
        l
            |> List.foldr add ( 0, 0 )
            |> scalarMult (1 / toFloat (List.length l))
            |> Just


distance : Point -> Point -> Float
distance v w =
    length (diff v w)


findAllInRadius : { points : List Point, radius : Float, center : Point } -> List Point
findAllInRadius { points, radius, center } =
    let
        isNearEnough v =
            distance v center <= radius
    in
        points |> List.filter isNearEnough


{-| applies circular coordinates
-}
applyCircularCoords :
    { maxObjectRadius : Float, center : Point }
    -> List { a | position : Point }
    -> List { a | position : Point }
applyCircularCoords { maxObjectRadius, center } objectList =
    let
        n =
            List.length objectList

        circumference =
            (toFloat n) * (20 + maxObjectRadius)

        circleRadius =
            circumference / (2 * pi)

        posOf : Int -> Point
        posOf i =
            let
                angle =
                    (toFloat i) * 2 * pi / (toFloat n)
            in
                ( Tuple.first center + circleRadius * sin angle
                , Tuple.second center + circleRadius * cos angle
                )
    in
        objectList
            |> List.indexedMap (\i o -> { o | position = posOf i })
