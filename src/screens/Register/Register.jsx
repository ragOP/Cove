import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Image,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {FontStyles} from '../../styles/fontStyles';
import CustomOtp from '../../components/CustomOtp/CustomOtp';
import UserAgreementFooter from '../../components/Footer/UserAgreementFooter';
import {useNavigation} from '@react-navigation/native';
import {FEMALE, MALE, OTHER} from '../../constants/GENDER';
import CustomTextInput from '../../components/CustomTextField/CustomTextField';
import CustomButton from '../../components/CustomButton/CustomButton';
import {DatePicker} from 'react-native-wheel-pick';
import {onRegister} from '../../apis/onRegister';
import CustomSnackbar from '../../components/CustomSnackbar/CustomSnackbar';
import {Paths} from '../../navigaton/paths';
import {onUpdateDetails} from '../../apis/onUpdateDetails';
import useDebounce from '../../hooks/useDebounce';
import {usernameAvailability} from '../../apis/usernameAvailability';
import {useDispatch} from 'react-redux';
import {login} from '../../redux/slice/authSlice';
import CustomPhoneInput from '../../components/CustomPhoneInput/CustomPhoneInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TOKEN} from '../../constants/AUTH';
import {launchImageLibrary} from 'react-native-image-picker';
import {Avatar, Button} from 'react-native-paper';

const PhoneNumberForm = ({goNext, form, setForm}) => {
  const phoneInput = useRef(null);
  const navigation = useNavigation();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const onUserRegister = async () => {
    const phoneNumberLength = form.phoneNumber.length;

    if (phoneNumberLength === 10) {
      goNext();
    } else {
      setSnackbarMessage('Please enter a valid 10-digit phone number');
      setSnackbarVisible(true);
    }
  };

  const onStartScreen = () => {
    navigation.navigate('Start');
  };

  const onChangeNumber = number => {
    const dialCode = phoneInput.current?.getCallingCode() || '';

    const sanitizedText = number.replace(/[^0-9]/g, '');

    setForm(prev => ({
      ...prev,
      dialCode: dialCode,
      phoneNumber: sanitizedText,
    }));
  };

  return (
    <>
      <View style={styles.phoneNumberFormContainer}>
        <View style={styles.phoneNumberTopContainer}>
          <TouchableOpacity onPress={onStartScreen}>
            <View style={styles.iconBox}>
              <Icon name="chevron-back" size={30} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.phoneInputContainer}>
            <Text style={[styles.headingText, FontStyles.heading]}>
              Phone number
            </Text>

            <View style={styles.phoneFormContainer}>
              <CustomPhoneInput
                ref={phoneInput}
                value={form.phoneNumber}
                onChangeText={onChangeNumber}
                autoFocus={true}
              />
            </View>
            <CustomButton
              title="Send Verification Code"
              onClick={onUserRegister}
            />
          </View>
        </View>

        <UserAgreementFooter />
      </View>

      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </>
  );
};

const PhoneNumberVerification = ({goNext, goBack, form, otp, setOtp}) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const intervalRef = useRef(null);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [time, setTime] = useState(30);
  const [isValidating, setIsValidating] = useState(false);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  const onChangeOtp = currentOtp => {
    setOtp(currentOtp);
  };

  const onVerifyOtp = async () => {
    if (isValidating) {
      return;
    }

    try {
      setIsValidating(true);

      const payload = {
        phoneNumber: form.phoneNumber,
        otp: otp,
      };

      const apiResponse = await onRegister({payload});
      console.log('API Response:', apiResponse);

      if (apiResponse?.response?.success) {
        const statusCode = apiResponse?.response?.statusCode;

        const data = apiResponse?.response?.data;
        const token = data?.token;
        const userData = data?.user;

        dispatch(
          login({
            token: token,
            user: {
              id: userData?._id,
              name: userData?.name,
              username: userData?.username,
              phoneNumber: userData?.phoneNumber,
              email: userData?.email,
            },
          }),
        );
        await AsyncStorage.setItem(TOKEN, token);

        setSnackbarMessage('OTP verified successfully');
        setSnackbarVisible(true);
        stopTimer();

        if (statusCode === 200) {
          navigation.navigate(Paths.HOME);
        } else {
          setTimeout(() => {
            goNext();
          }, 500);
        }
      } else {
        setSnackbarMessage(
          apiResponse?.response?.message || 'Invalid OTP, please try again',
        );
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setSnackbarMessage('Error verifying OTP, please try again');
      setSnackbarVisible(true);
    } finally {
      setIsValidating(false);
    }
  };

  const onResendOtp = () => {
    setTime(30);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <>
      <View style={styles.phoneOtpContainer}>
        <View style={styles.iconBox}>
          <TouchableOpacity onPress={goBack}>
            <Icon name="chevron-back" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.otpNumberContainer}>
          <Text style={styles.otpNumberTextHeader}>
            Verification code has been sent to{' '}
          </Text>
          <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
            +{form.dialCode} {form.phoneNumber}
          </Text>
          <View style={styles.otpContainer}>
            <CustomOtp onTextChange={onChangeOtp} />
            {time <= 0 ? (
              <TouchableOpacity onPress={onResendOtp}>
                <Text style={styles.resendText}>Resend</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTextTimer}>Resend in {time}s</Text>
            )}
          </View>

          <View style={styles.verifyCodeContainer}>
            <CustomButton
              title="Verify code"
              onClick={onVerifyOtp}
              style={styles.verfiyCodeButton}
              isLoading={isValidating}
              disabled={otp.length < 6 || isValidating}
            />
          </View>
        </View>
      </View>

      <CustomSnackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </>
  );
};

const NameInput = ({goNext, goBack, form, setForm}) => {
  const onChangeName = name => {
    setForm(prev => ({
      ...prev,
      name: name,
    }));
  };
  return (
    <View style={styles.nameInputContainer}>
      {/* <TouchableOpacity onPress={goBack}>
        <View style={styles.iconBox}>
          <Icon name="chevron-back" size={30} color="#fff" />
        </View>
      </TouchableOpacity> */}

      <View style={styles.nameInputInnerContainer}>
        <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
          What's your name?
        </Text>
        <CustomTextInput
          placeholder="Enter Full Name..."
          onChangeText={onChangeName}
          value={form.name}
          autoFocus={true}
        />
        <View style={styles.nameInputIconContainer}>
          <TouchableOpacity onPress={goNext}>
            <View style={styles.nameInputIconBox}>
              <Icon name="chevron-forward" size={30} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const BirthDateInput = ({goNext, goBack, form, setForm}) => {
  const onChangeDate = selectedDate => {
    setForm(prev => ({
      ...prev,
      dob: selectedDate,
    }));
  };

  const selectedDate = form.dob ? form.dob : new Date();

  return (
    <View style={styles.birthDateFormContainer}>
      <View style={styles.birthDateTopContainer}>
        <TouchableOpacity onPress={goBack}>
          <View style={styles.iconBox}>
            <Icon name="chevron-back" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.birthDateTextContainer}>
        <Text style={[FontStyles.heading, styles.birthDateHeaderText]}>
          What's your date of {'\n'}Birth?
        </Text>
      </View>
      <View style={styles.dateSelectContainer}>
        <DatePicker
          date={selectedDate}
          style={styles.datePickerStyles}
          maximumDate={new Date()}
          onDateChange={onChangeDate}
          minimumDate={new Date(1990, 0, 1)}
          textColor="#fff"
          dividerColor="#fff"
        />
        {/* <DatePicker mode="date" textColor="green" /> */}
        {/* <DatePicker
          date={date}
          onDateChange={setDate}
          mode="date"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          dividerColor="#fff"
          theme="dark"
          locale="en-US"
        /> */}
      </View>

      <View style={styles.birthDateMainContainer}>
        <TouchableOpacity onPress={goNext}>
          <View style={styles.nameInputIconBox}>
            <Icon name="chevron-forward" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const GenderSelect = ({goNext, goBack, form, setForm}) => {
  const GENDER_TYPES = [MALE, FEMALE, OTHER];
  const ICON_MAPPING = {
    [MALE]: require('./../../assets/images/gender-male.png'),
    [FEMALE]: require('./../../assets/images/gender-female.png'),
    [OTHER]: require('./../../assets/images/gender-other-icon.png'),
  };

  const selectedGender = form.gender;

  const onGenderSelect = currentGender => {
    setForm(prev => ({
      ...prev,
      gender: currentGender,
    }));
  };

  return (
    <View style={styles.genderFormContainer}>
      <View style={styles.genderTopContainer}>
        <TouchableOpacity onPress={goBack}>
          <View style={styles.iconBox}>
            <Icon name="chevron-back" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.genderTextContainer}>
        <Text style={[FontStyles.heading, styles.genderHeaderText]}>
          Choose your {'\n'}Gender?
        </Text>
      </View>
      <View style={styles.genderSelectContainer}>
        {GENDER_TYPES.map((gender, index) => (
          <Pressable
            key={gender}
            style={[
              styles.genderOptionContainer,
              index !== GENDER_TYPES.length - 1 && styles.divider,
              gender === selectedGender && styles.selectedGender,
            ]}
            onPress={() => onGenderSelect(gender)}>
            <View style={styles.genderOptionInnerContainer}>
              <View style={styles.genderOptionBox}>
                <Image
                  source={ICON_MAPPING[gender]}
                  style={styles.genderImage}
                />
              </View>
            </View>
            <Text
              style={[
                styles.genderOptionText,
                gender === selectedGender && styles.selectedGender,
              ]}>
              {gender}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.genderForwardContainer}>
        <TouchableOpacity onPress={goNext}>
          <View style={styles.nameInputIconBox}>
            <Icon name="chevron-forward" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const UsernameInput = ({goNext, goBack, form, setForm}) => {
  const username = form.username;

  const [isAvailable, setIsAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    visible: false,
    message: '',
    type: 'info',
  });

  const debouncedUsername = useDebounce(username, 500);

  const onChangeUsername = currentUsername => {
    setForm(prev => ({
      ...prev,
      username: currentUsername,
    }));
  };

  const onValidateUsername = () => {
    if (username.length < 6) {
      setSnackbarState(prev => ({
        ...prev,
        visible: true,
        message: 'Username must be at least 6 characters long',
        type: 'error',
      }));

      return;
    }

    if (!isAvailable) {
      setSnackbarState(prev => ({
        ...prev,
        visible: true,
        message: 'Username is not available',
        type: 'error',
      }));

      return;
    }

    if (username.length > 5 && isAvailable) {
      setSnackbarState(prev => ({
        ...prev,
        visible: true,
        message: 'Username is available',
        type: 'success',
      }));

      setTimeout(() => {
        goNext();
      }, 1000);
    }
  };

  const onCloseSnackbar = () => {
    setSnackbarState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (debouncedUsername) {
        setIsChecking(true);
        try {
          const apiResponse = await usernameAvailability({
            payload: {username: debouncedUsername},
          });

          if (apiResponse?.response?.success) {
            setIsAvailable(true);
          }
        } catch (error) {
          console.error('Error checking username availability:', error);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsAvailable(false);
      }
    };

    if (debouncedUsername.length > 5) {
      checkUsernameAvailability();
    }
  }, [debouncedUsername]);

  return (
    <>
      <View style={styles.usernameFormContainer}>
        <TouchableOpacity onPress={goBack}>
          <View style={styles.iconBox}>
            <Icon name="chevron-back" size={30} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.userNameInnerContainer}>
          <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
            Enter Username
          </Text>

          <CustomTextInput
            placeholder="Enter username"
            value={username}
            onChangeText={onChangeUsername}
            autoFocus={true}
          />

          {isChecking ? (
            <Text style={styles.loadingText}>Checking...</Text>
          ) : username.length > 5 ? (
            <>
              {isAvailable === true && (
                <Text style={styles.successText}>Username is available!</Text>
              )}
              {isAvailable === false && (
                <Text style={styles.errorText}>Username is taken.</Text>
              )}
            </>
          ) : (
            <Text style={styles.errorText}>{''}</Text>
          )}

          <View style={styles.usernameInputIconContainer}>
            <TouchableOpacity onPress={onValidateUsername}>
              <View style={styles.nameInputIconBox}>
                <Icon name="chevron-forward" size={30} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CustomSnackbar
        visible={snackbarState.visible}
        message={snackbarState.message}
        type={snackbarState.type}
        onDismiss={onCloseSnackbar}
      />
    </>
  );
};

const PasswordInput = ({goNext, goBack, form, setForm}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    visible: false,
    message: '',
    type: 'info',
  });

  const onSubmit = async () => {
    if (isCreatingAccount) {
      return;
    }

    try {
      setIsCreatingAccount(true);

      if (form.password !== form.confirmPassword) {
        setSnackbarState(prev => ({
          visible: true,
          message: 'Passwords do not match',
          type: 'error',
        }));
        return;
      }

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('username', form.username);
      formData.append('password', form.password);
      formData.append('dob', form.dob.toISOString());
      console.log('profilePicture', form.profilePicture);

      if (form.profilePicture) {
        formData.append('profilePicture', {
          uri: form.profilePicture.uri,
          type: form.profilePicture.type || 'image/jpeg',
          name: form.profilePicture.fileName || 'profile.jpg',
        });
      }

      const apiResponse = await onUpdateDetails({payload: formData});
      console.log('apiResponse', apiResponse);
      if (apiResponse?.response?.success) {
        setSnackbarState(prev => ({
          visible: true,
          message: 'Account created successfully',
          type: 'success',
        }));

        const data = apiResponse?.response?.data;
        const userData = data?.user;

        dispatch(
          login({
            token: userData?.token,
            user: {
              id: userData?.id,
              name: userData?.name,
              username: userData?.username,
              phoneNumber: userData?.phoneNumber,
              email: userData?.email,
            },
          }),
        );

        navigation.navigate(Paths.HOME);
      } else {
        const errrorMessage = apiResponse?.response?.message;
        setSnackbarState(prev => ({
          visible: true,
          message: errrorMessage || 'Error creating account, please try again',
          type: 'error',
        }));
      }
    } catch (error) {
      console.error(error);
      setSnackbarState(prev => ({
        visible: true,
        message: 'Error creating account, please try again',
        type: 'error',
      }));
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const onChangePassword = password => {
    setForm(prev => ({
      ...prev,
      password: password,
    }));
  };

  const onChangeConfirmPassword = confirmPassword => {
    setForm(prev => ({
      ...prev,
      confirmPassword: confirmPassword,
    }));
  };

  const password = form.password;
  const confirmPassword = form.confirmPassword;

  const onCloseSnackbar = () => {
    setSnackbarState(prev => ({
      ...prev,
      visible: false,
    }));
  };

  return (
    <>
      <View style={styles.passwordFormContainer}>
        <TouchableOpacity onPress={goBack}>
          <View style={styles.iconBox}>
            <Icon name="chevron-back" size={30} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.passwordInnerContainer}>
          <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
            Set Password
          </Text>

          <CustomTextInput
            placeholder="Enter password"
            value={password}
            onChangeText={onChangePassword}
            autoFocus={true}
          />
        </View>

        <View style={styles.passwordInnerContainer}>
          <Text style={[FontStyles.heading, styles.otpNumberTextSubHeader]}>
            Confirm Password
          </Text>

          <CustomTextInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
          />
        </View>

        <View style={styles.createAccountButtonContainer}>
          <CustomButton
            title="Create Account"
            onClick={onSubmit}
            isLoading={isCreatingAccount}
          />
        </View>
      </View>

      <CustomSnackbar
        visible={snackbarState.visible}
        message={snackbarState.message}
        type={snackbarState.type}
        onDismiss={onCloseSnackbar}
      />
    </>
  );
};

const ImageUploadScreen = ({goNext, goBack, form, setForm}) => {
  const [imageUri, setImageUri] = useState(form.profilePicture.uri || null);

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.4,
      },
      response => {
        if (response.didCancel) {
          return;
        }

        if (response.errorCode) {
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          setImageUri(asset.uri);
          setForm(prev => ({
            ...prev,
            profilePicture: asset,
          }));
        }
      },
    );
  };

  return (
    <View style={styles.imageUploadContainer}>
      <TouchableOpacity onPress={goBack}>
        <View style={styles.iconBox}>
          <Icon name="chevron-back" size={30} color="#fff" />
        </View>
      </TouchableOpacity>
      <View style={styles.avatarContainer}>
        <Avatar.Image
          size={120}
          source={
            imageUri ? {uri: imageUri} : require('../../assets/images/user.png')
          }
          style={styles.avatar}
        />
        <Button
          mode="contained"
          icon="camera"
          onPress={pickImage}
          style={styles.uploadButton}>
          Upload Image
        </Button>
      </View>

      <View style={styles.imageIconContainer}>
        <TouchableOpacity onPress={goNext}>
          <View style={styles.nameInputIconBox}>
            <Icon name="chevron-forward" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    dialCode: '91',
    phoneNumber: '',
    name: '',
    dob: null,
    gender: 'Male',
    username: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
  });

  const [otp, setOtp] = useState('');

  const goNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhoneNumberForm goNext={goNext} form={form} setForm={setForm} />
        );
      case 2:
        return (
          <PhoneNumberVerification
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
            otp={otp}
            setOtp={setOtp}
          />
        );
      case 3:
        return (
          <NameInput
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 4:
        return (
          <BirthDateInput
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 5:
        return (
          <GenderSelect
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 6:
        return (
          <UsernameInput
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 7:
        return (
          <ImageUploadScreen
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      case 8:
        return (
          <PasswordInput
            goNext={goNext}
            goBack={goBack}
            form={form}
            setForm={setForm}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
};

export default Register;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '60%',
  },

  headingText: {
    color: '#fff',
  },
  iconBox: {
    paddingHorizontal: 10,
    paddingVertical: 30,
  },

  // Phone Number Form Styles
  phoneNumberFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    justifyContent: 'space-between',
  },
  phoneNumberTopContainer: {
    display: 'flex',
    gap: 64,
  },
  phoneInputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    paddingHorizontal: 40,
  },
  phoneFormContainer: {
    display: 'flex',
    width: '100%',
    gap: 20,
  },

  // Phone OTP Verification Styles
  phoneOtpContainer: {
    flex: 1,
    backgroundColor: '#181818',
  },
  otpNumberContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  otpNumberTextHeader: {
    color: '#fff',
    fontSize: 16,
  },
  otpNumberTextSubHeader: {
    color: '#fff',
  },
  otpContainer: {
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  resendText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    textDecorationColor: '#fff',
    textDecorationLine: 'underline',
  },
  resendTextTimer: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  verifyCodeContainer: {
    display: 'flex',
    width: '80%',
  },

  // Name Input Styles
  nameInputContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 24,
  },
  nameInputInnerContainer: {
    display: 'flex',
    gap: 28,
    paddingHorizontal: 40,
    marginTop: 100,
  },
  nameInputIconContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  nameInputIconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 50,
    borderRadius: '50%',
    padding: 10,
    backgroundColor: '#D28A8C',
  },

  // Birth Date Input Styles
  birthDateFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 24,
    width: '100%',
  },
  birthDateTopContainer: {
    display: 'flex',
  },
  birthDateHeaderText: {
    fontFamily: 'Kumbh-Sans',
    color: '#fff',
    letterSpacing: 1.125,
  },
  birthDateTextContainer: {
    display: 'flex',
    width: '80%',
    alignItems: 'center',
  },
  dateSelectContainer: {
    display: 'flex',
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  datePickerStyles: {
    backgroundColor: 'transparent',
    color: '#fff',
    width: 370,
    height: 240,
  },
  birthDateMainContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 10,
    width: '90%',
  },

  // Gender Select Styles
  genderFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 24,
    width: '100%',
  },
  genderTopContainer: {
    display: 'flex',
  },
  genderTextContainer: {
    display: 'flex',
    marginLeft: 50,
  },
  genderHeaderText: {
    color: '#fff',
    letterSpacing: 1.5,
    lineHeight: 34,
  },
  genderSelectContainer: {
    display: 'flex',
    gap: 20,
    marginHorizontal: 20,
    marginTop: 10,
  },

  // Gender Option Styles
  genderOptionContainer: {
    gap: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  genderOptionBox: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  genderImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    overflow: 'hidden',
  },
  genderOptionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  divider: {
    borderBottomWidth: 1,
    borderBlockColor: '#fff',
    paddingBottom: 18,
  },
  selectedGender: {
    color: '#D28A8C',
  },
  genderForwardContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: '90%',
  },

  // Username  Input Styles
  usernameFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 24,
    width: '100%',
  },
  userNameInnerContainer: {
    display: 'flex',
    gap: 28,
    paddingHorizontal: 40,
  },
  usernameInputIconContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#A8D28C',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#D28A8C',
    fontSize: 14,
    textAlign: 'center',
  },

  createAccountButtonContainer: {
    paddingHorizontal: 40,
  },

  // Image Upload Styles
  imageUploadContainer: {
    flex: 1,
    backgroundColor: '#181818',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  avatar: {
    backgroundColor: '#333',
    marginBottom: 16,
  },
  uploadButton: {
    marginTop: 8,
    backgroundColor: '#D28A8C',
  },
  imageIconContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 40,
    marginRight: 20,
  },

  // Password Input Styles
  passwordFormContainer: {
    flex: 1,
    backgroundColor: '#181818',
    gap: 42,
    width: '100%',
  },
  passwordInnerContainer: {
    display: 'flex',
    gap: 20,
    paddingHorizontal: 40,
  },
  passwordInputIconContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginRight: 40,
  },
});
