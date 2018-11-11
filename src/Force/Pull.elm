module Force.Pull exposing (Vertex, run)

import IntDict exposing (IntDict)
import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type alias Vertex =
    { id : Int
    , position : Point2d
    , velocity : Vector2d
    , pullCenter : Point2d
    , pullStrength : Float
    }


run : Float -> List Vertex -> List ( Int, Vector2d )
run alpha =
    let
        handle : Vertex -> ( Int, Vector2d )
        handle { id, position, velocity, pullCenter, pullStrength } =
            let
                --var k = .1 * e.alpha;
                --// Push nodes toward their designated focus.
                --nodes.forEach(function(o, i) {
                --  o.y += (foci[o.id].y - o.y) * k;
                --  o.x += (foci[o.id].x - o.x) * k;
                --});
                k =
                    pullStrength * alpha

                velocityDelta =
                    Vector2d.from position pullCenter
                        |> Vector2d.scaleBy k
            in
            ( id
            , Vector2d.sum velocity velocityDelta
            )
    in
    List.map handle
