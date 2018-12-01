module Algorithm exposing (StepResult(..), run)


type StepResult stepData
    = Next stepData
    | End


{-| stepData must hold all information for the visualization of that step.
-}
run :
    { input : input
    , init : input -> stepData
    , step : stepData -> StepResult stepData
    }
    -> List stepData
run { input, init, step } =
    let
        helper : stepData -> List stepData -> List stepData
        helper lastStepData past =
            case step lastStepData of
                Next nextStepData ->
                    helper nextStepData (lastStepData :: past)

                End ->
                    lastStepData :: past
    in
    helper (init input) []
