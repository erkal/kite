module PanAndZoom.Basics exposing (..)

{-|
ScaleAndTranslate holds the translation and scale of the svg object that we are manipulating.

Svg 'transform's are concataneted from right to left.
For example,
   translate(300,300)scale(2)
first scales and then translates, whereas
   scale(2)translate(300,300)
firs translates and then scales.

We will always assume them ordered as in the former,
    that is, we first scale  and then we translate.
-}


type alias ScaleAndTranslate =
    { scale : Float
    , translate : Point
    }


default : ScaleAndTranslate
default =
    { scale = 1
    , translate = ( 0, 0 )
    }


type alias Point =
    ( Float, Float )


add : Point -> Point -> Point
add ( px, py ) ( qx, qy ) =
    ( px + qx, py + qy )


subtract : Point -> Point -> Point
subtract ( px, py ) ( qx, qy ) =
    ( px - qx, py - qy )


times : Float -> Point -> Point
times k ( px, py ) =
    ( k * px, k * py )


extractTransformForSvg : ScaleAndTranslate -> String
extractTransformForSvg { scale, translate } =
    "translate("
        ++ toString (Tuple.first translate)
        ++ ","
        ++ toString (Tuple.second translate)
        ++ ")"
        ++ "scale("
        ++ toString scale
        ++ ")"


{-| The order of this should be thought as in matrix multiplication.
    First the right matrix is apllied to the argument then the left one.

    To see the entries are correct, type
        {{k,0,a},{0,k,b},{0,0,1}} {{l,0,c},{0,l,d},{0,0,1}}
    into wolfphramalpha and you get
        {{k l, 0, a + c k}, {0, k l, b + d k}, {0, 0, 1}}
-}
concat : ScaleAndTranslate -> ScaleAndTranslate -> ScaleAndTranslate
concat p q =
    let
        k =
            p.scale * q.scale

        ( a, b ) =
            p.translate

        ( c, d ) =
            q.translate
    in
        { scale = k
        , translate = ( a + c * k, b + d * k )
        }


{-| As in matrix inverse.
    To see that this is correct, type
        inverse {{k,0,a},{0,k,b},{0,0,1}}
    into wolframalpha.
-}
inverse : ScaleAndTranslate -> ScaleAndTranslate
inverse p =
    let
        k =
            p.scale

        ( a, b ) =
            p.translate
    in
        { scale = 1 / k
        , translate = ( -a / k, -b / k )
        }


applyToPoint : ScaleAndTranslate -> ( Float, Float ) -> ( Float, Float )
applyToPoint p ( x, y ) =
    ( p.scale * x + Tuple.first p.translate
    , p.scale * y + Tuple.second p.translate
    )


getTranslate : ScaleAndTranslate -> Point
getTranslate model =
    model.translate


getScale : ScaleAndTranslate -> Float
getScale model =
    model.scale


pan : { translateAtStart : Point, delta : Point } -> ScaleAndTranslate -> ScaleAndTranslate
pan { translateAtStart, delta } model =
    { model | translate = add translateAtStart delta }


zoom : { translateAtStart : Point, scaleAtStart : Float, center : Point, delta : Float, minScale : Float, maxScale : Float } -> ScaleAndTranslate -> ScaleAndTranslate
zoom { translateAtStart, scaleAtStart, center, delta, minScale, maxScale } model =
    let
        newScale =
            clamp minScale maxScale (scaleAtStart + delta)
    in
        { model
            | scale = newScale
            , translate =
                subtract translateAtStart center
                    |> times (newScale / scaleAtStart - 1)
                    |> add translateAtStart
        }
