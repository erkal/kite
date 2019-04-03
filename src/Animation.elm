module Animation exposing (State, elapsedTimeRatio, hasFinished, initialState, update)


type State
    = State
        { elapsed : Float
        , duration : Float
        }


initialState : State
initialState =
    State
        { elapsed = 0
        , duration = 300
        }


update : Float -> State -> State
update timeDelta (State tS) =
    State { tS | elapsed = tS.elapsed + timeDelta }


hasFinished : State -> Bool
hasFinished (State { elapsed, duration }) =
    elapsed > duration


elapsedTimeRatio : State -> Float
elapsedTimeRatio (State { elapsed, duration }) =
    elapsed / duration
