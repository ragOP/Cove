import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import {
    setGallerySelectionMode,
    setSelectedItems,
    clearSelectedItems,
    updateMultipleGalleryItems
} from '../../redux/slice/gallerySlice';
import { markAsSensitive } from '../../apis/markAsSensitive';
import CustomDialog from '../CustomDialog/CustomDialog';

const GallerySelectionBar = () => {
    const dispatch = useDispatch();
    const selectedItems = useSelector(state => state.gallery.selectedItems || []);
    const allItemsCount = selectedItems.length;
    const isAllSelected = selectedItems.length > 0;

    // Dialog states
    const [markSensitiveDialog, setMarkSensitiveDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleMarkSensitive = async () => {
        if (selectedItems.length === 0) {
            // Show error dialog for no items selected
            setMarkSensitiveDialog(true);
            return;
        }

        setMarkSensitiveDialog(true);
    };

    const handleMarkSensitiveConfirm = async () => {
        try {
            setIsLoading(true);
            const ids = selectedItems.map(item => item._id);
            console.log('Marking items as sensitive:', ids);

            const response = await markAsSensitive({ ids });

            if (response?.response?.success === true) {
                // Update Redux state to reflect the changes immediately
                dispatch(updateMultipleGalleryItems({ 
                    itemIds: ids, 
                    updates: { isSensitive: true }
                }));

                // Success - clear selection and exit selection mode
                dispatch(clearSelectedItems());
                dispatch(setGallerySelectionMode(false));

                // Close dialog
                setMarkSensitiveDialog(false);
            } else {
                // Handle error
                console.error('Failed to mark items as sensitive:', response);
                setMarkSensitiveDialog(false);
            }
        } catch (error) {
            console.error('Error marking items as sensitive:', error);
            setMarkSensitiveDialog(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = () => {
        setDeleteDialog(true);
    };

    const handleDeleteConfirm = () => {
        // TODO: Implement delete API call
        console.log('Deleting items:', selectedItems.map(item => item._id));
        dispatch(clearSelectedItems());
        dispatch(setGallerySelectionMode(false));
        setDeleteDialog(false);
    };

    const handleCancel = () => {
        dispatch(clearSelectedItems());
        dispatch(setGallerySelectionMode(false));
    };

    return (
        <>
            <View style={styles.selectionBottomBar}>
                <TouchableOpacity
                    style={styles.selectionNavButton}
                    onPress={handleMarkSensitive}
                    activeOpacity={0.8}>
                    <MaterialIcon name="shield-outline" size={24} color="#D28A8C" />
                    <Text style={styles.selectionNavLabel}>Mark as Sensitive</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.selectionNavButton}
                    onPress={handleDelete}
                    activeOpacity={0.8}>
                    <MaterialIcon name="delete-outline" size={24} color="#D28A8C" />
                    <Text style={styles.selectionNavLabel}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.selectionNavButton}
                    onPress={handleCancel}
                    activeOpacity={0.8}>
                    <MaterialIcon name="close" size={24} color="#D28A8C" />
                    <Text style={styles.selectionNavLabel}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {/* Mark as Sensitive Dialog */}
            <CustomDialog
                visible={markSensitiveDialog}
                onDismiss={() => !isLoading && setMarkSensitiveDialog(false)}
                title="Mark as Sensitive"
                message={`Are you sure you want to mark ${selectedItems.length} item(s) as sensitive?`}
                icon="shield-outline"
                iconColor="#D28A8C"
                confirmText="Mark Sensitive"
                cancelText="Cancel"
                onConfirm={handleMarkSensitiveConfirm}
                onCancel={() => setMarkSensitiveDialog(false)}
                confirmButtonColor="#D28A8C"
                showCancel={true}
                isLoading={isLoading}
            />

            {/* Delete Dialog */}
            <CustomDialog
                visible={deleteDialog}
                onDismiss={() => setDeleteDialog(false)}
                title="Delete Items"
                message={`Are you sure you want to delete ${selectedItems.length} item(s)?`}
                icon="delete-outline"
                iconColor="#ff4444"
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteDialog(false)}
                confirmButtonColor="#ff4444"
                destructive={true}
            />
        </>
    );
};

const styles = StyleSheet.create({
    selectionBottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#181818',
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        height: 80,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        elevation: 10,
    },
    selectionNavButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    selectionNavLabel: {
        color: '#D28A8C',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
});

export default GallerySelectionBar; 