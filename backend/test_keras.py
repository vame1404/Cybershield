import os
import tensorflow as tf
deepfake_dir = r'C:\Users\HP\OneDrive\Desktop\Clg and work\Major-proj\Cybershield-2\deepfake'
model_path = os.path.join(deepfake_dir, 'ICV3_FINAL.keras')
print('Path:', model_path)
try:
    df_model = tf.keras.models.load_model(model_path)
    print("Loaded successfully")
except Exception as e:
    print("Failed:")
    import traceback
    traceback.print_exc()
