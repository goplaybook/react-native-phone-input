import React, { Component } from 'react';
import { Text, TouchableOpacity, View, Modal, Picker } from 'react-native';
import PropTypes from 'prop-types';

import Country from './country';
import styles from './styles';

const propTypes = {
  buttonColor: PropTypes.string,
  labels: PropTypes.array,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  itemStyle: PropTypes.object,
  onSubmit: PropTypes.func,
};

export default class CountryPicker extends Component {
  static getDerivedStateFromProps(props, state) {
    return { selectedCountry: props.selectedCountry };
  }

  constructor(props) {
    super(props);

    this.state = {
      buttonColor: this.props.buttonColor || '#007AFF',
      modalVisible: false,
      selectedCountry: this.props.selectedCountry || Country.getAll()[0],
    };
  }

  selectCountry = selectedCountry => this.setState({ selectedCountry });
  onPressCancel = () => this.setState({ modalVisible: false });
  onPressSubmit = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.selectedCountry);
    }
    this.setState({ modalVisible: false });
  }

  show = () => this.setState({ modalVisible: true });
  renderItem = ({ iso2, name }, index) => <Picker.Item key={iso2} value={iso2} label={name} />;

  render() {
    const { buttonColor } = this.state;
    const itemStyle = this.props.itemStyle || {};
    return (
      <Modal
        animationType="slide"
        visible={this.state.modalVisible}
        onRequestClose={() => {
          console.log('Country picker has been closed.');
        }}
        transparent
      >
        <View style={styles.basicContainer}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: this.props.pickerBackgroundColor || 'white' },
            ]}
          >
            <View style={styles.buttonView}>
              <TouchableOpacity onPress={this.onPressCancel}>
                <Text style={[{ color: buttonColor }, this.props.buttonTextStyle]}>
                  {this.props.cancelText || 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={this.onPressSubmit}>
                <Text style={[{ color: buttonColor }, this.props.buttonTextStyle]}>
                  {this.props.confirmText || 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mainBox}>
              <Picker
                style={styles.bottomPicker}
                selectedValue={this.state.selectedCountry}
                onValueChange={this.selectCountry}
                itemStyle={itemStyle}
                mode="dialog"
              >
                {Country.getAll().map(this.renderItem)}
              </Picker>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

CountryPicker.propTypes = propTypes;
