port module PageLayout exposing (..)

import Window
import Task exposing (Task)


-- MODEL


type alias Model =
    { browserWindow :
        { top : Int
        , left : Int
        , width : Int
        , height : Int
        }
    , leftBar :
        { top : Int
        , left : Int
        , width : Int
        , height : Int
        }
    , rightBar :
        { top : Int
        , left : Int
        , width : Int
        , height : Int
        }
    , tabsBar :
        { top : Int
        , left : Int
        , width : Int
        , height : Int
        }
    , bottomBar :
        { top : Int
        , left : Int
        , width : Int
        , height : Int
        }
    , graphSvg :
        { top : Int
        , left : Int
        , width : Int
        , height : Int
        }
    , welcomeWindow :
        { top : Int
        , left : Int
        , width : Int
        , height : Int
        }
    }


dimensions : { e | height : a, left : b, top : c, width : d } -> List ( String, String )
dimensions el =
    [ ( "position", "absolute" )
    , ( "top", toString el.top ++ "px" )
    , ( "left", toString el.left ++ "px" )
    , ( "width", toString el.width ++ "px" )
    , ( "height", toString el.height ++ "px" )
    ]


calculate : { windowWidth : Int, windowHeight : Int } -> Model
calculate { windowWidth, windowHeight } =
    { browserWindow =
        { top = 0
        , left = 0
        , width = windowWidth
        , height = windowHeight
        }
    , leftBar =
        { top = 0
        , left = 0
        , width = 250
        , height = windowHeight
        }
    , rightBar =
        { top = 0
        , left = windowWidth - 250
        , width = 250
        , height = windowHeight
        }
    , tabsBar =
        { top = 0
        , left = 250
        , width = windowWidth - 500
        , height = 65
        }
    , bottomBar =
        { top = windowHeight - 40
        , left = 0
        , width = windowWidth
        , height = 40
        }
    , graphSvg =
        { top = 0
        , left = 0
        , width = windowWidth
        , height = windowHeight
        }
    , welcomeWindow =
        let
            ( w, h ) =
                ( min (windowWidth - 60) 600
                , min (windowHeight - 60) 500
                )
        in
            { top = windowHeight // 2 - h // 2
            , left = windowWidth // 2 - w // 2
            , width = w
            , height = h
            }
    }


initialCmd : Cmd Msg
initialCmd =
    Task.perform UpdateSize Window.size



--UPDATE


type Msg
    = UpdateSize Window.Size


update : Msg -> Model -> Model
update msg model =
    case msg of
        UpdateSize { width, height } ->
            calculate
                { windowWidth = width
                , windowHeight = height
                }



--SUBSCRIPTIONS


subscriptions : Sub Msg
subscriptions =
    Window.resizes UpdateSize
