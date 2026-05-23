"""
Quick training test with reduced epochs to verify improvement
Uses 100 epochs instead of 100 to demo quickly
"""

from IA-chatboot.vit_autism_model import ViTAutismModel

print("="*60)
print("QUICK TRAINING TEST - Ensemble ViT for Autism Detection")
print("="*60)

model = ViTAutismModel('.')
model.load_data()

print(f'\nDataset:')
print(f'  Train: {len(model.train_paths)} images')
print(f'  Val: {len(model.val_paths)} images')
print(f'  Test: {len(model.test_paths)} images')

print('\nBuilding ensemble model (Swin-L + ViT-B + ConvNeXt)...')
model.build_model('ensemble')

print('\nTraining with advanced augmentation (100 epochs)...')
model.train(epochs=100, batch_size=32)

print('\nEvaluating with Test-Time Augmentation...')
metrics = model.evaluate_ensemble()

print('\n' + '='*60)
print('RESULTS')
print('='*60)
print(f'Accuracy:    {metrics["accuracy"]:.2%}')
print(f'F1-Score:    {metrics["f1_macro"]:.2%}')
print(f'Precision:   {metrics["precision_macro"]:.2%}')
print(f'Recall:      {metrics["recall_macro"]:.2%}')
print('='*60)

if metrics['accuracy'] >= 0.90:
    print('✅ SUCCESS: Accuracy > 90% achieved!')
else:
    print('⚠️  Accuracy < 90%. May need more data/epochs.')
