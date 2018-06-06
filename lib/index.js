import React, { Component } from 'react';
import { Text, Image, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import PropTypes from 'prop-types';
import Emoji from 'node-emoji';

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

    this.getFlag = Flags.get;
    this.getEmoji = Emojis.get;

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

  onChangePhoneNumber = (number) => {
    const actionAfterSetState = this.props.onChangePhoneNumber && (() => {
      this.props.onChangePhoneNumber(number)
    });
    this.updateFlagAndFormatNumber(number, actionAfterSetState);
  }

  onPressFlag = () => {
    if (this.props.onPressFlag) {
      this.props.onPressFlag();
    } else {
      if (this.state.iso2) this.selectCountry(this.state.iso2);
      this.picker.show();
    }
  }

  getPickerData = () => PhoneNumber.getAllCountries().map((country, index) => ({
    key: index,
    emoji: Emojis.get(country.iso2),
    image: Flags.get(country.iso2),
    label: country.name,
    dialCode: `+${country.dialCode}`,
    iso2: country.iso2
  }));

  isValidNumber = () => PhoneNumber.isValidNumber( this.state.formattedNumber, this.state.iso2);
  getCountryCode = () => PhoneNumber.getCountryDataByCode(this.state.iso2).dialCode; 
  getAllCountries = () => PhoneNumber.getAllCountries(); 
  getDialCode = () => PhoneNumber.getDialCode(this.state.formattedNumber);
  getNumberType = () => PhoneNumber.getNumberType(this.state.formattedNumber, this.state.iso2);

  getValue = () => this.state.formattedNumber;
  getISOCode = () => this.state.iso2;
  selectCountry = (iso2) => {
    if (this.state.iso2 !== iso2) {
      const countryData = PhoneNumber.getCountryDataByCode(iso2);
      if (countryData) {
        this.setState({ iso2, formattedNumber: `+${countryData.dialCode}` },
          () => {
            if (this.props.onSelectCountry) this.props.onSelectCountry(iso2);
          }
        );
      }
    }
  }

  updateFlagAndFormatNumber = (number, actionAfterSetState = null) => {
    const { allowZeroAfterCountryCode, initialCountry } = this.props;
    const iso2 = number ? PhoneNumber.getCountryCodeOfNumber(number) : initialCountry;
    let phoneNumber = number;

    if (number) {
      if (phoneNumber[0] !== '+') phoneNumber = `+${phoneNumber}`;
      const dialCode = PhoneNumber.getDialCode(number);
      phoneNumber = allowZeroAfterCountryCode || !number.startsWith(`${dialCode}0`)
        ? phoneNumber
        : dialCode + number.substr(dialCode.length + 1);
    }
    actionAfterSetState();
    this.setState({ iso2, formattedNumber: phoneNumber }, actionAfterSetState);
  }

  focus = () => this.inputPhone.focus();

  setPicker = (ref) => {
    this.picker = ref;
  }

  setInput = (ref) => {
    this.inputPhone = ref;
  }

  render() {
    const { iso2, formattedNumber, disabled } = this.state;
    const TextComponent = this.props.textComponent || TextInput;
    const tag = `flag-${iso2}`;
    const emoji = Emoji.hasEmoji(tag) ? Emoji.get(tag) : Emojis.get(iso2) && Emojis.get(iso2).emoji;
    const flag = !emoji && Flags.get(iso2);
    return (
      <View style={[styles.container, this.props.style]}>
        <TouchableWithoutFeedback
          onPress={this.onPressFlag}
          disabled={disabled}
        >
          <View style={this.props.flagStyle}>
            {!flag ? (
              <Text style={{ fontSize: 18 }}>{emoji || Emoji.get(`flag-us`)}</Text>
            ) : (
              <Image
                source={Flags.get(iso2)}
                style={[styles.flag]}
                onPress={this.onPressFlag}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
        <View style={{ flex: 1, marginLeft: this.props.offset || 10 }}>
          <TextComponent
            ref={this.setInput}
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
          ref={this.setPicker}
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
