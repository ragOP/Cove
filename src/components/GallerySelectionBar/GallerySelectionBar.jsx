import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { markAsSensitive } from '../../apis/markAsSensitive';
import { markAsUnsensitive } from '../../apis/markAsUnsensitive';
import { deleteMessages } from '../../apis/deleteMessages';
import { showSnackbar } from '../../redux/slice/snackbarSlice';
import { clearSelectedItems, updateMultipleGalleryItems, removeGalleryItems } from '../../redux/slice/gallerySlice';
import CustomDialog from '../CustomDialog/CustomDialog';

const GallerySelectionBar = ({
    // Props-based mode (for contact gallery)
    selectedItems = [],
    onMarkSensitive,
    onMarkUnsensitive,
    onDelete,
    onCancel,
    // Redux-based mode (for main gallery)
    useRedux = false,
    conversationId
}) => {
    const dispatch = useDispatch();

    // Redux state for main gallery (using gallery slice)
    const reduxSelectedItems = useSelector(state => {
        if (!useRedux) return [];
        return state.gallery.selectedItems || [];
    });

    // Determine which selected items to use
    const items = useRedux ? reduxSelectedItems : selectedItems;

    // Dialog states for Redux mode
    const [markSensitiveDialog, setMarkSensitiveDialog] = React.useState(false);
    const [markUnsensitiveDialog, setMarkUnsensitiveDialog] = React.useState(false);
    const [deleteDialog, setDeleteDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUnsensitiveLoading, setIsUnsensitiveLoading] = React.useState(false);

    // Redux actions
    const handleReduxMarkSensitive = async () => {
        if (items.length === 0) {
            dispatch(showSnackbar({
                type: 'error',
                title: 'Error',
                subtitle: 'No items selected',
                placement: 'top',
            }));
            return;
        }
        setMarkSensitiveDialog(true);
    };

    const handleReduxMarkUnsensitive = async () => {
        if (items.length === 0) {
            dispatch(showSnackbar({
                type: 'error',
                title: 'Error',
                subtitle: 'No items selected',
                placement: 'top',
            }));
            return;
        }
        setMarkUnsensitiveDialog(true);
    };

    const handleReduxDelete = () => {
        // Check if all selected items are sensitive
        const allSensitive = items.every(item => item.isSensitive);

        // If all items are sensitive, delete directly without showing dialog
        if (allSensitive) {
            handleDeleteConfirm();
            return;
        }

        // Otherwise, show the confirmation dialog
        setDeleteDialog(true);
    };

    const handleReduxCancel = () => {
        // Clear gallery selection
        dispatch(clearSelectedItems());
    };

    const handleMarkSensitiveConfirm = async () => {
        try {
            setIsLoading(true);
            const ids = items.map(item => item._id);
            console.log('Marking items as sensitive:', ids);

            const response = await markAsSensitive({ ids });

            if (response?.response?.success === true) {
                console.log('Successfully marked as sensitive:', response.response.data);
                dispatch(showSnackbar({
                    type: 'success',
                    title: 'Marked as Sensitive',
                    subtitle: `${response.response.data.length} item(s) marked as sensitive`,
                    placement: 'top',
                }));

                // Update gallery items with sensitive status
                dispatch(updateMultipleGalleryItems({
                    itemIds: ids,
                    updates: { isSensitive: true }
                }));

                // Clear gallery selection
                dispatch(clearSelectedItems());
                setMarkSensitiveDialog(false);
            } else {
                console.error('Failed to mark items as sensitive:', response);
                dispatch(showSnackbar({
                    type: 'error',
                    title: 'Error',
                    subtitle: response?.response?.message || 'Failed to mark as sensitive',
                    placement: 'top',
                }));
                setMarkSensitiveDialog(false);
            }
        } catch (error) {
            console.error('Error marking items as sensitive:', error);
            dispatch(showSnackbar({
                type: 'error',
                title: 'Server Error',
                subtitle: 'Failed to mark as sensitive',
                placement: 'top',
            }));
            setMarkSensitiveDialog(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkUnsensitiveConfirm = async () => {
        try {
            setIsUnsensitiveLoading(true);
            const ids = items.map(item => item._id);
            console.log('Marking items as insensitive:', ids);

            const response = await markAsUnsensitive({ ids });

            if (response?.response?.success === true) {
                console.log('Successfully marked as insensitive:', response.response.data);
                dispatch(showSnackbar({
                    type: 'success',
                    title: 'Marked as Insensitive',
                    subtitle: `${response.response.data.length} item(s) marked as insensitive`,
                    placement: 'top',
                }));

                // Update gallery items with insensitive status
                dispatch(updateMultipleGalleryItems({
                    itemIds: ids,
                    updates: { isSensitive: false }
                }));

                // Clear gallery selection
                dispatch(clearSelectedItems());
                setMarkUnsensitiveDialog(false);
            } else {
                console.error('Failed to mark items as insensitive:', response);
                dispatch(showSnackbar({
                    type: 'error',
                    title: 'Error',
                    subtitle: response?.response?.message || 'Failed to mark as insensitive',
                    placement: 'top',
                }));
                setMarkUnsensitiveDialog(false);
            }
        } catch (error) {
            console.error('Error marking items as insensitive:', error);
            dispatch(showSnackbar({
                type: 'error',
                title: 'Server Error',
                subtitle: 'Failed to mark as insensitive',
                placement: 'top',
            }));
            setMarkUnsensitiveDialog(false);
        } finally {
            setIsUnsensitiveLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            const ids = items.map(item => item._id);
            console.log('Deleting items:', ids);

            const response = await deleteMessages({ ids, conversationId });

            if (response?.response?.success) {
                console.log('Successfully deleted items:', response.response.data);
                dispatch(showSnackbar({
                    type: 'success',
                    title: 'Deleted',
                    subtitle: `${ids.length} item(s) deleted successfully`,
                    placement: 'top',
                }));

                // Remove items from gallery state
                dispatch(removeGalleryItems(ids));

                // Clear gallery selection
                dispatch(clearSelectedItems());
                setDeleteDialog(false);
            } else {
                console.error('Failed to delete items:', response);
                const errorMessage = response?.response?.data?.message || 'Failed to delete items';
                dispatch(showSnackbar({
                    type: 'error',
                    title: 'Error',
                    subtitle: errorMessage,
                    placement: 'top',
                }));
                setDeleteDialog(false);
            }
        } catch (error) {
            console.error('Error deleting items:', error);
            dispatch(showSnackbar({
                type: 'error',
                title: 'Server Error',
                subtitle: 'Failed to delete items',
                placement: 'top',
            }));
            setDeleteDialog(false);
        }
    };

    // Determine which handlers to use
    const handleMarkSensitive = useRedux ? handleReduxMarkSensitive : () => onMarkSensitive?.(items);
    const handleMarkUnsensitive = useRedux ? handleReduxMarkUnsensitive : () => onMarkUnsensitive?.(items);
    const handleDelete = useRedux ? handleReduxDelete : () => onDelete?.(items);
    const handleCancel = useRedux ? handleReduxCancel : onCancel;

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
                    onPress={handleMarkUnsensitive}
                    activeOpacity={0.8}>
                    <MaterialIcon name="shield-off-outline" size={24} color="#D28A8C" />
                    <Text style={styles.selectionNavLabel}>Mark as Insensitive</Text>
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

            {/* Dialogs for Redux mode only */}
            {useRedux && (
                <>
                    {/* Mark as Sensitive Dialog */}
                    <CustomDialog
                        visible={markSensitiveDialog}
                        onDismiss={() => !isLoading && setMarkSensitiveDialog(false)}
                        title="Mark as Sensitive"
                        message={`Are you sure you want to mark ${items.length} item(s) as sensitive?`}
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

                    {/* Mark as Insensitive Dialog */}
                    <CustomDialog
                        visible={markUnsensitiveDialog}
                        onDismiss={() => !isUnsensitiveLoading && setMarkUnsensitiveDialog(false)}
                        title="Mark as Insensitive"
                        message={`Are you sure you want to mark ${items.length} item(s) as insensitive?`}
                        icon="shield-off-outline"
                        iconColor="#D28A8C"
                        confirmText="Mark Insensitive"
                        cancelText="Cancel"
                        onConfirm={handleMarkUnsensitiveConfirm}
                        onCancel={() => setMarkUnsensitiveDialog(false)}
                        confirmButtonColor="#D28A8C"
                        showCancel={true}
                        isLoading={isUnsensitiveLoading}
                    />

                    {/* Delete Dialog */}
                    <CustomDialog
                        visible={deleteDialog}
                        onDismiss={() => setDeleteDialog(false)}
                        title="Delete Items"
                        message={`Are you sure you want to delete ${items.length} item(s)?`}
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
            )}
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
        paddingHorizontal: 8,
    },
    selectionNavButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    selectionNavLabel: {
        color: '#D28A8C',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
});

export default GallerySelectionBar; 