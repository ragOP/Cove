import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native';
import {Text, Searchbar} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import ContactRow from './ContactRow';
import HomeStyles from '../styles/HomeStyles';
import {Paths} from '../../../navigaton/paths';

const UniversalSearchSeparator = () => <View style={HomeStyles.universalSearchSeparator} />;

const ContactsUniversalSearch = ({ contacts, onClose, navigation, userId }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(() => {
      const lower = query.toLowerCase();
      setResults(
        contacts.filter(c => {
          const name = c.displayName || c.name || '';
          return name.toLowerCase().includes(lower);
        })
      );
      setSearching(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, contacts]);

  return (
    <View style={[HomeStyles.searchPageFull, {paddingHorizontal: 0}]}> 
      <View style={[HomeStyles.searchPageHeader, {paddingHorizontal: 12, paddingTop: 16, paddingBottom: 12, backgroundColor: '#181818'}]}>
        <TouchableOpacity onPress={onClose} style={{paddingRight: 12, justifyContent: 'center', alignItems: 'center'}}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Searchbar
            autoFocus
            placeholder="Search"
            value={query}
            onChangeText={setQuery}
            style={[HomeStyles.searchBar, {marginLeft: 0, marginRight: 0}]}
            iconColor="#D28A8C"
            placeholderTextColor="#D28A8C"
            inputStyle={{fontSize: 16, color: '#fff'}}
          />
        </View>
      </View>
      <FlatList
        data={results}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={{paddingHorizontal: 8, paddingVertical: 2}}>
            <ContactRow
              item={item}
              onPress={() => {
                onClose();
                navigation.navigate(Paths.CONTACT_CHAT, { contact: item });
              }}
              userId={userId}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{height: 8}} />}
        ListEmptyComponent={
          searching ? (
            <View style={{alignItems: 'center', marginTop: 32}}>
              <ActivityIndicator size="small" color="#D28A8C" />
              <Text style={HomeStyles.universalSearchLoadingText}>Searching...</Text>
            </View>
          ) : query.trim() ? (
            <View style={HomeStyles.universalSearchEmptyContainer}>
              <Icon name="people-outline" size={64} color="#D28A8C" style={HomeStyles.universalSearchEmptyIcon} />
              <Text style={HomeStyles.universalSearchEmptyTitle}>No Contacts Found</Text>
              <Text style={HomeStyles.universalSearchEmptySubtitle}>
                No contacts match your search. Try a different name or username.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{paddingBottom: 32, paddingTop: 8}}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default ContactsUniversalSearch;
