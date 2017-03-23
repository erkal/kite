module ConvexHull exposing (Point, convexHull)

{- converted from Haskell code found in
   https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
-}


type alias Point =
    ( Float, Float )


convexHull : List Point -> List Point
convexHull points =
    if List.length points <= 1 then
        points
    else
        let
            sorted =
                points |> List.sortBy Tuple.first

            lower =
                chain sorted

            upper =
                chain (List.reverse sorted)
        in
            List.concat [ lower, upper ]


chain : List Point -> List Point
chain =
    let
        go : List Point -> List Point -> List Point
        go acc l =
            case ( acc, l ) of
                ( r1 :: r2 :: rs, x :: xs ) ->
                    if clockwise r2 r1 x then
                        go (r2 :: rs) (x :: xs)
                    else
                        go (x :: acc) xs

                ( acc, x :: xs ) ->
                    go (x :: acc) xs

                ( acc, [] ) ->
                    List.tail acc
                        |> Maybe.withDefault []
                        |> List.reverse
    in
        go []


clockwise : Point -> Point -> Point -> Bool
clockwise o a b =
    let
        cross : Point -> Point -> Float
        cross ( x1, y1 ) ( x2, y2 ) =
            x1 * y2 - x2 * y1

        sub : Point -> Point -> Point
        sub ( x1, y1 ) ( x2, y2 ) =
            ( x1 - x2, y1 - y2 )
    in
        cross (sub a o) (sub b o) <= 0
