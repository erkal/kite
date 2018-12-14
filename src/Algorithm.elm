module Algorithm exposing (Algorithm, Result(..), basic, run)


type Algorithm input state
    = Algorithm
        { init : input -> state
        , step : input -> state -> Result state
        }


type Result state
    = Next state
    | End


basic initAndStep =
    Algorithm initAndStep


run : Algorithm input state -> input -> List state
run (Algorithm { init, step }) input =
    let
        helper lastStepData past =
            case step input lastStepData of
                Next nextStepData ->
                    helper nextStepData (lastStepData :: past)

                End ->
                    lastStepData :: past
    in
    List.reverse
        (helper (init input) [])
