with open('adi_extracted.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Find first occurrence of questions array
idx = content.find('"questions"')
if idx != -1:
    print('Found questions at index', idx)
    print('Context (500 chars before and after):')
    context = content[max(0,idx-500):idx+500]
    with open('context.txt', 'w', encoding='utf-8') as f:
        f.write(context)