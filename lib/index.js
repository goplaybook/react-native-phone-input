import React, { Component } from 'react';
import { Text, Image, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import PropTypes from 'prop-types';

import Country from './country';
import Flags from './resources/flags';
import Emojis from './resources/emojis';
import PhoneNumber from './phoneNumber';
import styles from './styles';
import CountryPicker from './countryPicker';

export default class PhoneInput extends Component {
  static setCustomCountriesData(json) {
    Country.setCustomCountriesData(json);
  }

  static getDerivedStateFromProps(props, state) {
    const { value, disabled } = props;
    let newState = { disabled };

    if (value && value !== state.value) {
      const { allowZeroAfterCountryCode, initialCountry } = props;
      const iso2 = value ? PhoneNumber.getCountryCodeOfNumber(value) : initialCountry;
      let phoneNumber = value;
      if (phoneNumber) {
        if (phoneNumber[0] !== '+') phoneNumber = `+${phoneNumber}`;
        const dialCode = PhoneNumber.getDialCode(phoneNumber);
        phoneNumber = allowZeroAfterCountryCode || !phoneNumber.startsWith(`${dialCode}0`)
          ? phoneNumber
          : dialCode + phoneNumber.substr(dialCode.length + 1);
      }
      newState = { ...newState, iso2, formattedNumber: phoneNumber, value };
    }

    return newState;
  }

  constructor(props, context) {
    super(props, context);

    this.onChangePhoneNumber = this.onChangePhoneNumber.bind(this);
    this.onPressFlag = this.onPressFlag.bind(this);
    this.selectCountry = this.selectCountry.bind(this);
    this.getFlag = this.getFlag.bind(this);
    this.getISOCode = this.getISOCode.bind(this);

    const { countriesList, disabled, initialCountry } = this.props;

    if (countriesList) {
      Country.setCustomCountriesData(countriesList);
    }
    const countryData = PhoneNumber.getCountryDataByCode(initialCountry);

    this.state = {
      iso2: initialCountry,
      disabled,
      formattedNumber: countryData ? `+${countryData.dialCode}` : '',
      value: null
    };
  }

  componentWillMount() {
    if (this.props.value) {
      this.updateFlagAndFormatNumber(this.props.value);
    }
  }

  onChangePhoneNumber(number) {
    const actionAfterSetState = this.props.onChangePhoneNumber && (() => this.props.onChangePhoneNumber(number));
    this.updateFlagAndFormatNumber(number, actionAfterSetState);
  }

  onPressFlag() {
    if (this.props.onPressFlag) {
      this.props.onPressFlag();
    } else {
      if (this.state.iso2) this.picker.selectCountry(this.state.iso2);
      this.picker.show();
    }
  }

  getPickerData() {
    return PhoneNumber.getAllCountries().map((country, index) => ({
      key: index,
      emoji: Emojis.get(country.iso2),
      image: Flags.get(country.iso2),
      label: country.name,
      dialCode: `+${country.dialCode}`,
      iso2: country.iso2
    }));
  }

  getCountryCode() {
    return PhoneNumber.getCountryDataByCode(this.state.iso2).dialCode;
  }

  getAllCountries() {
    return PhoneNumber.getAllCountries();
  }

  getFlag(iso2) {
    return Flags.get(iso2);
  }

  getEmoji(iso2) {
    return Emojis.get(iso2);
  }

  getDialCode() {
    return PhoneNumber.getDialCode(this.state.formattedNumber);
  }

  getValue() {
    return this.state.formattedNumber;
  }

  getNumberType() {
    return PhoneNumber.getNumberType(
      this.state.formattedNumber,
      this.state.iso2
    );
  }

  getISOCode() {
    return this.state.iso2;
  }

  selectCountry(iso2) {
    if (this.state.iso2 !== iso2) {
      const countryData = PhoneNumber.getCountryDataByCode(iso2);
      if (countryData) {
        this.setState(
          {
            iso2,
            formattedNumber: `+${countryData.dialCode}`
          },
          () => {
            if (this.props.onSelectCountry) this.props.onSelectCountry(iso2);
          }
        );
      }
    }
  }

  isValidNumber() {
    return PhoneNumber.isValidNumber(
      this.state.formattedNumber,
      this.state.iso2
    );
  }

  updateFlagAndFormatNumber(number, actionAfterSetState = null) {
    const { allowZeroAfterCountryCode, initialCountry } = this.props;
    const iso2 = number ? PhoneNumber.getCountryCodeOfNumber(number) : initialCountry;
    let phoneNumber = number;

    if (number) {
      if (phoneNumber[0] !== '+') phoneNumber = `+${phoneNumber}`;
      const dialCode = PhoneNumber.getDialCode(number);
      phoneNumber = allowZeroAfterCountryCode || !number.startsWith(`${dialCode}0`)
        ? phoneNumber
        : dialCode + number.substr(dialCode.length + 1);
      iso2 = PhoneNumber.getCountryCodeOfNumber(phoneNumber);
    }
    this.setState({ iso2, formattedNumber: phoneNumber }, actionAfterSetState);
  }

  possiblyEliminateZeroAfterCountryCode(number) {
    const dialCode = PhoneNumber.getDialCode(number);
    return number.startsWith(`${dialCode}0`)
      ? dialCode + number.substr(dialCode.length + 1)
      : number;
  }

  focus() {
    this.inputPhone.focus();
  }

  render() {
    const { iso2, formattedNumber, disabled } = this.state;
    const TextComponent = this.props.textComponent || TextInput;
    return (
      <View style={[styles.container, this.props.style]}>
        <TouchableWithoutFeedback
          onPress={this.onPressFlag}
          disabled={disabled}
        >
          <View style={this.props.flagStyle}>
            <Text>{Emojis.get(iso2).emjoi}</Text>
          </View>
          {/*
          <Image
            source={Flags.get(iso2)}
            style={[styles.flag, this.props.flagStyle]}
            onPress={this.onPressFlag}
          />
          */}
        </TouchableWithoutFeedback>
        <View style={{ flex: 1, marginLeft: this.props.offset || 10 }}>
          <TextComponent
            ref={(ref) => {
              this.inputPhone = ref;
            }}
            editable={!disabled}
            autoCorrect={false}
            style={[styles.text, this.props.textStyle]}
            onChangeText={this.onChangePhoneNumber}
            keyboardType="phone-pad"
            underlineColorAndroid="rgba(0,0,0,0)"
            value={formattedNumber}
            {...this.props.textProps}
          />
        </View>

        <CountryPicker
          ref={(ref) => {
            this.picker = ref;
          }}
          selectedCountry={iso2}
          onSubmit={this.selectCountry}
          buttonColor={this.props.pickerButtonColor}
          buttonTextStyle={this.props.pickerButtonTextStyle}
          cancelText={this.props.cancelText}
          cancelTextStyle={this.props.cancelTextStyle}
          confirmText={this.props.confirmText}
          confirmTextStyle={this.props.confirmTextStyle}
          pickerBackgroundColor={this.props.pickerBackgroundColor}
          itemStyle={this.props.pickerItemStyle}
        />
      </View>
    );
  }
}

PhoneInput.propTypes = {
  textComponent: PropTypes.func,
  initialCountry: PropTypes.string,
  onChangePhoneNumber: PropTypes.func,
  value: PropTypes.string,
  style: PropTypes.object,
  flagStyle: PropTypes.object,
  textStyle: PropTypes.object,
  offset: PropTypes.number,
  textProps: PropTypes.object,
  onSelectCountry: PropTypes.func,
  pickerButtonColor: PropTypes.string,
  pickerBackgroundColor: PropTypes.string,
  pickerItemStyle: PropTypes.object,
  countriesList: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    iso2: PropTypes.string,
    dialCode: PropTypes.string,
    priority: PropTypes.number,
    areaCodes: PropTypes.arrayOf(PropTypes.string)
  })),
  cancelText: PropTypes.string,
  cancelTextStyle: PropTypes.object,
  confirmText: PropTypes.string,
  confirmTextTextStyle: PropTypes.object,
  disabled: PropTypes.bool,
  allowZeroAfterCountryCode: PropTypes.bool
};

PhoneInput.defaultProps = {
  initialCountry: 'us',
  disabled: false,
  allowZeroAfterCountryCode: true
};
