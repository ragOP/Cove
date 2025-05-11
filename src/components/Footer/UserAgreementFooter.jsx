import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const UserAgreementFooter = () => {
  return (
    <View style={styles.footerTextContainer}>
      <Text style={styles.footerTextTop}>By continuing, you agree to our </Text>
      <Text>
        <Text style={styles.footerText}>User Agreement </Text>
        <Text style={styles.footerTextTop}>and</Text>
        <Text style={styles.footerText}> Privacy Policy. </Text>
      </Text>
    </View>
  );
};

export default UserAgreementFooter;

const styles = StyleSheet.create({
  footerTextContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 2,
    marginBottom: 30,
  },
  footerTextTop: {
    color: 'rgba(255, 255, 255, 0.35)',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
