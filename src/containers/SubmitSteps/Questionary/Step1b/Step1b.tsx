import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import usePortal from 'react-useportal';
import { useTranslation, Trans } from 'react-i18next';

// Form
import { useForm, Controller } from 'react-hook-form';
import { useStateMachine } from 'little-state-machine';
import { yupResolver } from '@hookform/resolvers';
import { ErrorMessage } from '@hookform/error-message';
import * as Yup from 'yup';

// Helper
import { getPatientId } from 'helper/stepsDefinitions';

// Update Action
import { updateAction } from 'utils/wizard';

// Header Control
import useHeaderContext from 'hooks/useHeaderContext';

// Utils
import { scrollToTop } from 'helper/scrollHelper';

// Styles
import OptionList from 'components/OptionList';
import DatePicker from 'components/DatePicker';
import WizardButtons from 'components/WizardButtons';
import {
  QuestionText, MainContainer,
} from '../style';

const schemaWithoutPatient = Yup.object({
  pcrTestDate: Yup.date().when('$hasPcr', { is: true, then: Yup.date().required(), otherwise: Yup.date() }),
  pcrTestResult: Yup.string().when('$hasPcr', { is: true, then: Yup.string().required(), otherwise: Yup.string() }),
  antigenTestDate: Yup.date().when('$hasAntigen', { is: true, then: Yup.date().required(), otherwise: Yup.date() }),
  antigenTestResult: Yup.string().when('$hasAntigen', { is: true, then: Yup.string().required(), otherwise: Yup.string() }),
/* antibodyTestDate: Yup.date().when('$hasAntibody', { is: true, then: Yup.date().required(), otherwise: Yup.date() }),
antibodyTestResult: Yup.string().when('$hasAntibody', { is: true, then: Yup.string().required(),
otherwise: Yup.string() }), */
}).defined();

const schemaWithPatient = Yup.object({
  patientAntigenTestResult: Yup.string().oneOf(['positive', 'negative', '']).when('patientPcrTestResult', (value: string, schema: any) => (!value ? schema.required() : schema)),
  patientPcrTestResult: Yup.string().oneOf(['positive', 'negative', '']),
}).defined();

type Step1aType = Yup.InferType<typeof schemaWithoutPatient> | Yup.InferType<typeof schemaWithPatient>;

const Step1b = ({
  previousStep,
  nextStep,
  storeKey,
}: Wizard.StepProps) => {
  // Hooks
  const { Portal } = usePortal({
    bindTo: document && document.getElementById('wizard-buttons') as HTMLDivElement,
  });
  const {
    setDoGoBack, setTitle, setSubtitle, setType,
  } = useHeaderContext();
  const history = useHistory();
  const { t, i18n } = useTranslation();
  const { state, action } = useStateMachine(updateAction(storeKey));
  const patientId = getPatientId();

  // States
  const [activeStep, setActiveStep] = React.useState(true);
  const [hasPcrTest, setHasPcrTest] = React.useState(false);
  const [hasAntigenTest, setHasAntigenTest] = React.useState(false);
  // const [hasAntibodyTest, setHasAntibodyTest] = React.useState(false);
  const [patientHasPcrTest, setPatientHasPcrTest] = React.useState(true);
  const [patienthasAntigenTest, setPatientHasAntigenTest] = React.useState(true);

  useEffect(() => {
    if (state) {
      const { testTaken } = state['submit-steps'];

      setHasPcrTest(testTaken.includes('pcr'));
      setHasAntigenTest(testTaken.includes('antigen'));
      // setHasAntibodyTest(testTaken.includes('antibody'));
      setPatientHasPcrTest(true);
      setPatientHasAntigenTest(true);
    }
  }, [state]);

  // Form
  const {
    control, handleSubmit, formState,
  } = useForm({
    mode: 'onChange',
    defaultValues: state?.[storeKey],
    context: {
      hasPcr: state['submit-steps'].testTaken.includes('pcr'),
      hasAntigen: state['submit-steps'].testTaken.includes('antigen'),
      // hasAntibody: state['submit-steps'].testTaken.includes('antibody'),
    },
    resolver: yupResolver(patientId ? schemaWithPatient : schemaWithoutPatient),
  });
  const { errors, isValid } = formState;

  const handleDoBack = React.useCallback(() => {
    setActiveStep(false);
    if (previousStep) {
      history.push(previousStep);
    } else {
      history.goBack();
    }
  }, [history, previousStep]);

  useEffect(() => {
    scrollToTop();
    if (patientId) {
      setTitle('');
    } else {
      setTitle(t('questionary:headerText'));
    }
    if (patientId) {
      setType('tertiary');
    } else {
      setType('primary');
    }
    setSubtitle('');
    setDoGoBack(() => handleDoBack);
  }, [handleDoBack, setDoGoBack, setTitle, setType, setSubtitle, patientId, t]);

  // Handlers
  const onSubmit = async (values: Step1aType) => {
    if (values) {
      const {
        pcrTestDate,
        pcrTestResult,
        antigenTestDate,
        antigenTestResult,
        // antibodyTestDate,
        // antibodyTestResult,
        patientAntigenTestResult,
        patientPcrTestResult,
      } = (values as any);
      // if patient
      if (hasPcrTest && (!pcrTestDate || !pcrTestResult)) {
        return;
      }
      if (hasAntigenTest && (!antigenTestDate || !antigenTestResult)) {
        return;
      }
      if ((patientHasPcrTest && patientId) && (!patientPcrTestResult)) {
        return;
      }
      if ((patientAntigenTestResult && patientId) && (!patienthasAntigenTest)) {
        return;
      }
      /* if (hasAntibodyTest && (!antibodyTestDate || !antibodyTestResult)) {
        return;
      } */

      action(values);
      if (nextStep) {
        setActiveStep(false);
        history.push(nextStep);
      }
    }
  };

  return (
    <MainContainer>
      {(!patientId && hasPcrTest) && (
        <>
          <QuestionText extraSpace first>
            {t('questionary:whenPcrTest')}
          </QuestionText>

          <Controller
            control={control}
            name="pcrTestDate"
            defaultValue={undefined}
            render={({ onChange, value }) => (
              <DatePicker
                label="Date"
                value={value ? new Date(value) : null}
                locale={i18n.language}
                onChange={onChange}
              />
            )}
          />

          <QuestionText extraSpace>
            {t('questionary:resultPcrTest.question')}
          </QuestionText>
          <Controller
            control={control}
            name="pcrTestResult"
            defaultValue={undefined}
            render={({ onChange, value }) => (
              <OptionList
                singleSelection
                value={{ selected: value ? [value] : [] }}
                onChange={v => onChange(v.selected[0])}
                items={[
                  {
                    value: 'positive',
                    label: t('questionary:resultPcrTest.options.positive'),
                  },
                  {
                    value: 'negative',
                    label: t('questionary:resultPcrTest.options.negative'),
                  },
                  {
                    value: 'pending',
                    label: t('questionary:resultPcrTest.options.pending'),
                  },
                  {
                    value: 'unsure',
                    label: t('questionary:resultPcrTest.options.unsure'),
                  },
                ]}
              />
            )}
          />
        </>
      )}
      {(!patientId && hasAntigenTest) && (
        <>
          <QuestionText extraSpace first={!hasPcrTest}>
            {t('questionary:whenAntigenTest')}
          </QuestionText>

          <Controller
            control={control}
            name="antigenTestDate"
            defaultValue={undefined}
            render={({ onChange, value }) => (
              <DatePicker
                label="Date"
                value={value ? new Date(value) : null}
                locale={i18n.language}
                onChange={onChange}
              />
            )}
          />

          <QuestionText extraSpace>
            {t('questionary:resultAntigenTest.question')}
          </QuestionText>
          <Controller
            control={control}
            name="antigenTestResult"
            defaultValue={undefined}
            render={({ onChange, value }) => (
              <OptionList
                singleSelection
                value={{ selected: value ? [value] : [] }}
                onChange={v => onChange(v.selected[0])}
                items={[
                  {
                    value: 'positive',
                    label: t('questionary:resultAntigenTest.options.positive'),
                  },
                  {
                    value: 'negative',
                    label: t('questionary:resultAntigenTest.options.negative'),
                  },
                  {
                    value: 'pending',
                    label: t('questionary:resultAntigenTest.options.pending'),
                  },
                  {
                    value: 'unsure',
                    label: t('questionary:resultAntigenTest.options.unsure'),
                  },
                ]}
              />
            )}
          />
        </>
      )}
      {/* {hasAntibodyTest && (
        <>
          <QuestionText extraSpace first={!hasPcrTest}>
            {t('questionary:whenAntibodyTest')}
          </QuestionText>

          <Controller
            control={control}
            name="antibodyTestDate"
            defaultValue={undefined}
            render={({ onChange, value }) => (
              <DatePicker
                label="Date"
                value={value ? new Date(value) : null}
                locale={i18n.language}
                onChange={onChange}
              />
            )}
          />

          <QuestionText extraSpace>
            {t('questionary:resultAntibodyTest.question')}
          </QuestionText>
          <Controller
            control={control}
            name="antibodyTestResult"
            defaultValue={undefined}
            render={({ onChange, value }) => (
              <OptionList
                singleSelection
                value={{ selected: value ? [value] : [] }}
                onChange={v => onChange(v.selected[0])}
                items={[
                  {
                    value: 'positive',
                    label: t('questionary:resultAntibodyTest.options.positive'),
                  },
                  {
                    value: 'negative',
                    label: t('questionary:resultAntibodyTest.options.negative'),
                  },
                  {
                    value: 'pending',
                    label: t('questionary:resultAntibodyTest.options.pending'),
                  },
                  {
                    value: 'unsure',
                    label: t('questionary:resultAntibodyTest.options.unsure'),
                  },
                ]}
              />
            )}
          />
        </>
      )} */}
      {patientId && (
        <>
          <QuestionText extraSpace>
            <Trans i18nKey="questionary:patient:resultPcrTest.question">
              What was the result of Patient {patientId} PCR-based COVID-19 test?
            </Trans>
          </QuestionText>
          <Controller
            control={control}
            name="patientPcrTestResult"
            defaultValue=""
            render={({ onChange, value }) => (
              <OptionList
                singleSelection
                value={{ selected: value ? [value] : [] }}
                onChange={v => onChange(v.selected[0] || '')}
                items={[
                  {
                    value: 'positive',
                    label: t('questionary:resultPcrTest.options.positive'),
                  },
                  {
                    value: 'negative',
                    label: t('questionary:resultPcrTest.options.negative'),
                  },
                ]}
              />
            )}
          />
          <QuestionText extraSpace>
            <Trans i18nKey="questionary:patient:resultAntigenTest.question'">
              What was the result of Patient {patientId} rapid antigen COVID-19 test?
            </Trans>
          </QuestionText>
          <Controller
            control={control}
            name="patientAntigenTestResult"
            defaultValue=""
            render={({ onChange, value }) => (
              <OptionList
                singleSelection
                value={{ selected: value ? [value] : [] }}
                onChange={v => onChange(v.selected[0] || '')}
                items={[
                  {
                    value: 'positive',
                    label: t('questionary:resultAntigenTest.options.positive'),
                  },
                  {
                    value: 'negative',
                    label: t('questionary:resultAntigenTest.options.negative'),
                  },
                ]}
              />
            )}
          />
        </>
      )}
      {/* Bottom Buttons */}
      <p><ErrorMessage errors={errors} name="name" /></p>
      {activeStep && (
        <Portal>
          <WizardButtons
            leftLabel={t('questionary:nextButton')}
            leftHandler={handleSubmit(onSubmit)}
            leftDisabled={!isValid}
            invert
          />
        </Portal>
      )}
    </MainContainer>
  );
};

export default React.memo(Step1b);
